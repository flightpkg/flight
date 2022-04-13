"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsClasses = void 0;
const ts_morph_1 = require("ts-morph");
const js_class_1 = require("./js-class");
const set_utils_1 = require("../../util/set-utils");
const parse_destructured_props_1 = require("../../util/parse-destructured-props");
const parse_superclass_name_and_path_1 = require("./parse-superclass-name-and-path");
const is_this_referencing_var_1 = require("../../util/is-this-referencing-var");
const is_property_access_with_obj_1 = require("../../util/is-property-access-with-obj");
const logger_1 = __importDefault(require("../../logger/logger"));
/**
 * Parses the classes out of each .js file in the SourceFilesCollection, and
 * forms a tree representing their hierarchy.
 *
 * ## Description of algorithm:
 *
 * Each source file is parsed to find all file-level classes. Their superclasses
 * and import paths for those superclasses are also recorded to form an
 * adjacency list graph of classes keyed by their file path.
 *
 * Each class is also processed to find and record any property accesses of the
 * `this` object. For instance, in the following class, there are 3
 * PropertyAccessExpressions that pull from the `this` object ('something1',
 * 'something2', and 'something3'):
 *
 *     class Something {
 *         constructor() {
 *             this.something1 = 1;
 *             this.something2 = 2;
 *         }
 *
 *         someMethod() {
 *             console.log( this.something3 );
 *
 *             console.log( window.location );  // <-- not a `this` PropertyAccessExpression
 *         }
 *     }
 *
 * The returned graph will be used later to determine which TS class property
 * definitions should be placed in superclasses vs. subclasses. Properties used
 * by a superclass and a subclass should only be defined in the superclass.
 */
function parseJsClasses(tsAstProject) {
    logger_1.default.verbose("Parsing JS classes in the codebase...");
    const files = tsAstProject.getSourceFiles();
    const jsClasses = files.reduce((classes, file) => {
        logger_1.default.debug(`Parsing classes in file: ${file.getFilePath()}`);
        const fileClasses = parseFileClasses(file);
        return classes.concat(fileClasses);
    }, []);
    return jsClasses;
}
exports.parseJsClasses = parseJsClasses;
/**
 * Parses the file-level classes out of the given `sourceFile`.
 */
function parseFileClasses(sourceFile) {
    return sourceFile.getClasses().map(fileClass => {
        const className = fileClass.getName();
        logger_1.default.debug(`  Parsing class: ${className}`);
        const { superclassName, superclassPath } = (0, parse_superclass_name_and_path_1.parseSuperclassNameAndPath)(sourceFile, fileClass);
        const methodNames = getMethodNames(fileClass);
        const propertyNames = getPropertyNames(fileClass);
        const propertiesMinusMethods = (0, set_utils_1.difference)(propertyNames, methodNames); // remove any method names from this Set
        return new js_class_1.JsClass({
            path: sourceFile.getFilePath(),
            name: className,
            superclassName,
            superclassPath,
            methods: methodNames,
            properties: propertiesMinusMethods
        });
    });
}
/**
 * Parses the method names from the class into a Set of strings.
 */
function getMethodNames(fileClass) {
    return fileClass.getMethods()
        .reduce((methods, method) => {
        return methods.add(method.getName());
    }, new Set());
}
/**
 * Retrieves the list of propertyNames used in the class. This may also include
 * method names (which are technically properties), which we'll filter out later.
 */
function getPropertyNames(fileClass) {
    const existingPropertyDeclarations = parsePropertyDeclarations(fileClass); // in case we are actually parsing a TypeScript class with existing declarations
    const propertyAccesses = parsePropertyAccesses(fileClass);
    const destructuringUsesOfProperties = parseDestructuringThisAssignments(fileClass);
    const propertyAccessesOfThisAssignedVars = parsePropertyAccessesOfThisAssignedVars(fileClass);
    return (0, set_utils_1.union)(existingPropertyDeclarations, propertyAccesses, destructuringUsesOfProperties, propertyAccessesOfThisAssignedVars);
}
/**
 * In the case that the utility is actually parsing TypeScript classes with
 * existing property declarations, we want to know about these so we don't
 * accidentally write in new ones of the same name.
 */
function parsePropertyDeclarations(fileClass) {
    return fileClass.getInstanceProperties()
        .reduce((props, prop) => {
        const propName = prop.getName();
        return propName ? props.add(propName) : props; // don't add unnamed properties (not sure how we would have one of those, but seems its possible according to the TsSimpleAst types)
    }, new Set());
}
/**
 * Parses the property names of `this` PropertyAccessExpressions.
 *
 * Examples:
 *
 *     this.something = 42;
 *     console.log( this.something2 );
 *
 *     const { destructured1, destructured2 } = this;
 *
 * Method returns:
 *
 *    Set( [ 'something', 'something2', 'destructured1', 'destructured2' ] )
 */
function parsePropertyAccesses(fileClass) {
    // First, find all of the `this.something` properties
    const thisProps = fileClass
        .getDescendantsOfKind(ts_morph_1.SyntaxKind.PropertyAccessExpression)
        .filter((prop) => prop.getExpression().getKind() === ts_morph_1.SyntaxKind.ThisKeyword);
    const propNamesSet = thisProps
        .reduce((props, prop) => {
        return props.add(prop.getName());
    }, new Set());
    return propNamesSet;
}
/**
 * Parses any object destructuring statements of the form:
 *
 *     var { a, b } = this;
 *
 * And returns Set( [ 'a', 'b' ] ) in this case.
 */
function parseDestructuringThisAssignments(fileClass) {
    // Second, find any `var { a, b } = this` statements
    const destructuredProps = fileClass
        .getDescendantsOfKind(ts_morph_1.SyntaxKind.VariableDeclaration)
        .filter((varDec) => {
        return varDec.compilerNode.name.kind === ts_morph_1.SyntaxKind.ObjectBindingPattern;
    });
    return destructuredProps
        .reduce((propNames, varDec) => {
        const destructuredPropNames = (0, parse_destructured_props_1.parseDestructuredProps)(varDec.compilerNode.name);
        destructuredPropNames.forEach(propName => propNames.add(propName));
        return propNames;
    }, new Set());
}
/**
 * Parses property accesses of variables that are assigned to the `this`
 * keyword.
 *
 * For example:
 *
 *     var that = this;
 *
 *     that.someProp1 = 1;
 *     that.someProp2 = 2;
 *
 * In the above code, the Set( [ 'someProp1', 'someProp2' ] ) is returned
 */
function parsePropertyAccessesOfThisAssignedVars(fileClass) {
    const methods = fileClass.getMethods();
    return methods.reduce((propNames, method) => {
        const thisVarDeclarations = method
            .getDescendantsOfKind(ts_morph_1.SyntaxKind.VariableDeclaration)
            .filter(is_this_referencing_var_1.isThisReferencingVar);
        // Get the array of identifiers assigned to `this`. Ex: [ 'that', 'self' ]
        const thisVarIdentifiers = thisVarDeclarations
            .map((thisVarDec) => thisVarDec.getName());
        thisVarIdentifiers.forEach((thisVarIdentifier) => {
            // Get the properties accessed from the `this` identifiers (i.e. from
            // 'that', 'self', etc.)
            const propNamesAccessedFromIdentifier = method
                .getDescendantsOfKind(ts_morph_1.SyntaxKind.PropertyAccessExpression)
                .filter((0, is_property_access_with_obj_1.propertyAccessWithObjFilter)(thisVarIdentifier))
                .map((p) => p.getName());
            propNamesAccessedFromIdentifier
                .forEach((propName) => propNames.add(propName));
        });
        return propNames;
    }, new Set());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UtanMtY2xhc3Nlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb252ZXJ0ZXIvYWRkLWNsYXNzLXByb3BlcnR5LWRlY2xhcmF0aW9ucy9wYXJzZS1qcy1jbGFzc2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHVDQUErSztBQUMvSyx5Q0FBcUM7QUFDckMsb0RBQXlEO0FBQ3pELGtGQUE2RTtBQUM3RSxxRkFBOEU7QUFDOUUsZ0ZBQTBFO0FBQzFFLHdGQUFxRjtBQUNyRixpRUFBeUM7QUFFekM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0ErQkc7QUFDSCxTQUFnQixjQUFjLENBQUUsWUFBcUI7SUFDcEQsZ0JBQU0sQ0FBQyxPQUFPLENBQUUsdUNBQXVDLENBQUUsQ0FBQztJQUMxRCxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7SUFFNUMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBRSxDQUFFLE9BQWtCLEVBQUUsSUFBZ0IsRUFBRyxFQUFFO1FBQzFFLGdCQUFNLENBQUMsS0FBSyxDQUFFLDRCQUE0QixJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBRSxDQUFDO1FBRWpFLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFFLElBQUksQ0FBRSxDQUFDO1FBQzdDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBRSxXQUFXLENBQUUsQ0FBQztJQUN0QyxDQUFDLEVBQUUsRUFBRSxDQUFFLENBQUM7SUFFUixPQUFPLFNBQVMsQ0FBQztBQUNsQixDQUFDO0FBWkQsd0NBWUM7QUFHRDs7R0FFRztBQUNILFNBQVMsZ0JBQWdCLENBQUUsVUFBc0I7SUFDaEQsT0FBTyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFFLFNBQVMsQ0FBQyxFQUFFO1FBQy9DLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUV0Qyxn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LEdBQUcsQ0FBRSxDQUFFLFVBQStCLEVBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBRSxDQUFDO1FBRXJFLGtCQUFrQixDQUFDLE9BQU8sQ0FBRSxDQUFFLGlCQUF5QixFQUFHLEVBQUU7WUFDM0QscUVBQXFFO1lBQ3JFLHdCQUF3QjtZQUN4QixNQUFNLCtCQUErQixHQUFHLE1BQU07aUJBQzVDLG9CQUFvQixDQUFFLHFCQUFVLENBQUMsd0JBQXdCLENBQUU7aUJBQzNELE1BQU0sQ0FBRSxJQUFBLHlEQUEyQixFQUFFLGlCQUFpQixDQUFFLENBQUU7aUJBQzFELEdBQUcsQ0FBRSxDQUFFLENBQTJCLEVBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBRSxDQUFDO1lBRXhELCtCQUErQjtpQkFDN0IsT0FBTyxDQUFFLENBQUUsUUFBZ0IsRUFBRyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUUsQ0FBRSxDQUFDO1FBQ2hFLENBQUMsQ0FBRSxDQUFDO1FBRUosT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFVLENBQUUsQ0FBQztBQUN4QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJvamVjdCwgdHMsIENsYXNzRGVjbGFyYXRpb24sIENsYXNzSW5zdGFuY2VQcm9wZXJ0eVR5cGVzLCBNZXRob2REZWNsYXJhdGlvbiwgUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uLCBTb3VyY2VGaWxlLCBTeW50YXhLaW5kLCBWYXJpYWJsZURlY2xhcmF0aW9uIH0gZnJvbSBcInRzLW1vcnBoXCI7XG5pbXBvcnQgeyBKc0NsYXNzIH0gZnJvbSBcIi4vanMtY2xhc3NcIjtcbmltcG9ydCB7IGRpZmZlcmVuY2UsIHVuaW9uIH0gZnJvbSBcIi4uLy4uL3V0aWwvc2V0LXV0aWxzXCI7XG5pbXBvcnQgeyBwYXJzZURlc3RydWN0dXJlZFByb3BzIH0gZnJvbSBcIi4uLy4uL3V0aWwvcGFyc2UtZGVzdHJ1Y3R1cmVkLXByb3BzXCI7XG5pbXBvcnQgeyBwYXJzZVN1cGVyY2xhc3NOYW1lQW5kUGF0aCB9IGZyb20gXCIuL3BhcnNlLXN1cGVyY2xhc3MtbmFtZS1hbmQtcGF0aFwiO1xuaW1wb3J0IHsgaXNUaGlzUmVmZXJlbmNpbmdWYXIgfSBmcm9tIFwiLi4vLi4vdXRpbC9pcy10aGlzLXJlZmVyZW5jaW5nLXZhclwiO1xuaW1wb3J0IHsgcHJvcGVydHlBY2Nlc3NXaXRoT2JqRmlsdGVyIH0gZnJvbSBcIi4uLy4uL3V0aWwvaXMtcHJvcGVydHktYWNjZXNzLXdpdGgtb2JqXCI7XG5pbXBvcnQgbG9nZ2VyIGZyb20gXCIuLi8uLi9sb2dnZXIvbG9nZ2VyXCI7XG5cbi8qKlxuICogUGFyc2VzIHRoZSBjbGFzc2VzIG91dCBvZiBlYWNoIC5qcyBmaWxlIGluIHRoZSBTb3VyY2VGaWxlc0NvbGxlY3Rpb24sIGFuZFxuICogZm9ybXMgYSB0cmVlIHJlcHJlc2VudGluZyB0aGVpciBoaWVyYXJjaHkuXG4gKlxuICogIyMgRGVzY3JpcHRpb24gb2YgYWxnb3JpdGhtOlxuICpcbiAqIEVhY2ggc291cmNlIGZpbGUgaXMgcGFyc2VkIHRvIGZpbmQgYWxsIGZpbGUtbGV2ZWwgY2xhc3Nlcy4gVGhlaXIgc3VwZXJjbGFzc2VzXG4gKiBhbmQgaW1wb3J0IHBhdGhzIGZvciB0aG9zZSBzdXBlcmNsYXNzZXMgYXJlIGFsc28gcmVjb3JkZWQgdG8gZm9ybSBhblxuICogYWRqYWNlbmN5IGxpc3QgZ3JhcGggb2YgY2xhc3NlcyBrZXllZCBieSB0aGVpciBmaWxlIHBhdGguXG4gKlxuICogRWFjaCBjbGFzcyBpcyBhbHNvIHByb2Nlc3NlZCB0byBmaW5kIGFuZCByZWNvcmQgYW55IHByb3BlcnR5IGFjY2Vzc2VzIG9mIHRoZVxuICogYHRoaXNgIG9iamVjdC4gRm9yIGluc3RhbmNlLCBpbiB0aGUgZm9sbG93aW5nIGNsYXNzLCB0aGVyZSBhcmUgM1xuICogUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9ucyB0aGF0IHB1bGwgZnJvbSB0aGUgYHRoaXNgIG9iamVjdCAoJ3NvbWV0aGluZzEnLFxuICogJ3NvbWV0aGluZzInLCBhbmQgJ3NvbWV0aGluZzMnKTpcbiAqXG4gKiAgICAgY2xhc3MgU29tZXRoaW5nIHtcbiAqICAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgICAgICAgICB0aGlzLnNvbWV0aGluZzEgPSAxO1xuICogICAgICAgICAgICAgdGhpcy5zb21ldGhpbmcyID0gMjtcbiAqICAgICAgICAgfVxuICpcbiAqICAgICAgICAgc29tZU1ldGhvZCgpIHtcbiAqICAgICAgICAgICAgIGNvbnNvbGUubG9nKCB0aGlzLnNvbWV0aGluZzMgKTtcbiAqXG4gKiAgICAgICAgICAgICBjb25zb2xlLmxvZyggd2luZG93LmxvY2F0aW9uICk7ICAvLyA8LS0gbm90IGEgYHRoaXNgIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvblxuICogICAgICAgICB9XG4gKiAgICAgfVxuICpcbiAqIFRoZSByZXR1cm5lZCBncmFwaCB3aWxsIGJlIHVzZWQgbGF0ZXIgdG8gZGV0ZXJtaW5lIHdoaWNoIFRTIGNsYXNzIHByb3BlcnR5XG4gKiBkZWZpbml0aW9ucyBzaG91bGQgYmUgcGxhY2VkIGluIHN1cGVyY2xhc3NlcyB2cy4gc3ViY2xhc3Nlcy4gUHJvcGVydGllcyB1c2VkXG4gKiBieSBhIHN1cGVyY2xhc3MgYW5kIGEgc3ViY2xhc3Mgc2hvdWxkIG9ubHkgYmUgZGVmaW5lZCBpbiB0aGUgc3VwZXJjbGFzcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSnNDbGFzc2VzKCB0c0FzdFByb2plY3Q6IFByb2plY3QgKTogSnNDbGFzc1tdIHtcblx0bG9nZ2VyLnZlcmJvc2UoIFwiUGFyc2luZyBKUyBjbGFzc2VzIGluIHRoZSBjb2RlYmFzZS4uLlwiICk7XG5cdGNvbnN0IGZpbGVzID0gdHNBc3RQcm9qZWN0LmdldFNvdXJjZUZpbGVzKCk7XG5cblx0Y29uc3QganNDbGFzc2VzID0gZmlsZXMucmVkdWNlKCAoIGNsYXNzZXM6IEpzQ2xhc3NbXSwgZmlsZTogU291cmNlRmlsZSApID0+IHtcblx0XHRsb2dnZXIuZGVidWcoIGBQYXJzaW5nIGNsYXNzZXMgaW4gZmlsZTogJHtmaWxlLmdldEZpbGVQYXRoKCl9YCApO1xuXG5cdFx0Y29uc3QgZmlsZUNsYXNzZXMgPSBwYXJzZUZpbGVDbGFzc2VzKCBmaWxlICk7XG5cdFx0cmV0dXJuIGNsYXNzZXMuY29uY2F0KCBmaWxlQ2xhc3NlcyApO1xuXHR9LCBbXSApO1xuXG5cdHJldHVybiBqc0NsYXNzZXM7XG59XG5cblxuLyoqXG4gKiBQYXJzZXMgdGhlIGZpbGUtbGV2ZWwgY2xhc3NlcyBvdXQgb2YgdGhlIGdpdmVuIGBzb3VyY2VGaWxlYC5cbiAqL1xuZnVuY3Rpb24gcGFyc2VGaWxlQ2xhc3Nlcyggc291cmNlRmlsZTogU291cmNlRmlsZSApOiBKc0NsYXNzW10ge1xuXHRyZXR1cm4gc291cmNlRmlsZS5nZXRDbGFzc2VzKCkubWFwKCBmaWxlQ2xhc3MgPT4ge1xuXHRcdGNvbnN0IGNsYXNzTmFtZSA9IGZpbGVDbGFzcy5nZXROYW1lKCk7XG5cblx0XHRsb2dnZXIuZGVidWcoIGAgIFBhcnNpbmcgY2xhc3M6ICR7Y2xhc3NOYW1lfWAgKTtcblxuXHRcdGNvbnN0IHsgc3VwZXJjbGFzc05hbWUsIHN1cGVyY2xhc3NQYXRoIH0gPSBwYXJzZVN1cGVyY2xhc3NOYW1lQW5kUGF0aCggc291cmNlRmlsZSwgZmlsZUNsYXNzICk7XG5cdFx0Y29uc3QgbWV0aG9kTmFtZXMgPSBnZXRNZXRob2ROYW1lcyggZmlsZUNsYXNzICk7XG5cdFx0Y29uc3QgcHJvcGVydHlOYW1lcyA9IGdldFByb3BlcnR5TmFtZXMoIGZpbGVDbGFzcyApO1xuXHRcdGNvbnN0IHByb3BlcnRpZXNNaW51c01ldGhvZHMgPSBkaWZmZXJlbmNlKCBwcm9wZXJ0eU5hbWVzLCBtZXRob2ROYW1lcyApOyAgLy8gcmVtb3ZlIGFueSBtZXRob2QgbmFtZXMgZnJvbSB0aGlzIFNldFxuXG5cdFx0cmV0dXJuIG5ldyBKc0NsYXNzKCB7XG5cdFx0XHRwYXRoOiBzb3VyY2VGaWxlLmdldEZpbGVQYXRoKCksXG5cdFx0XHRuYW1lOiBjbGFzc05hbWUsXG5cdFx0XHRzdXBlcmNsYXNzTmFtZSxcblx0XHRcdHN1cGVyY2xhc3NQYXRoLFxuXHRcdFx0bWV0aG9kczogbWV0aG9kTmFtZXMsXG5cdFx0XHRwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzTWludXNNZXRob2RzXG5cdFx0fSApO1xuXHR9ICk7XG59XG5cblxuLyoqXG4gKiBQYXJzZXMgdGhlIG1ldGhvZCBuYW1lcyBmcm9tIHRoZSBjbGFzcyBpbnRvIGEgU2V0IG9mIHN0cmluZ3MuXG4gKi9cbmZ1bmN0aW9uIGdldE1ldGhvZE5hbWVzKCBmaWxlQ2xhc3M6IENsYXNzRGVjbGFyYXRpb24gKTogU2V0PHN0cmluZz4ge1xuXHRyZXR1cm4gZmlsZUNsYXNzLmdldE1ldGhvZHMoKVxuXHRcdC5yZWR1Y2UoICggbWV0aG9kczogU2V0PHN0cmluZz4sIG1ldGhvZDogTWV0aG9kRGVjbGFyYXRpb24gKSA9PiB7XG5cdFx0XHRyZXR1cm4gbWV0aG9kcy5hZGQoIG1ldGhvZC5nZXROYW1lKCkgKTtcblx0XHR9LCBuZXcgU2V0PHN0cmluZz4oKSApO1xufVxuXG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBsaXN0IG9mIHByb3BlcnR5TmFtZXMgdXNlZCBpbiB0aGUgY2xhc3MuIFRoaXMgbWF5IGFsc28gaW5jbHVkZVxuICogbWV0aG9kIG5hbWVzICh3aGljaCBhcmUgdGVjaG5pY2FsbHkgcHJvcGVydGllcyksIHdoaWNoIHdlJ2xsIGZpbHRlciBvdXQgbGF0ZXIuXG4gKi9cbmZ1bmN0aW9uIGdldFByb3BlcnR5TmFtZXMoIGZpbGVDbGFzczogQ2xhc3NEZWNsYXJhdGlvbiApIHtcblx0Y29uc3QgZXhpc3RpbmdQcm9wZXJ0eURlY2xhcmF0aW9ucyA9IHBhcnNlUHJvcGVydHlEZWNsYXJhdGlvbnMoIGZpbGVDbGFzcyApOyAgLy8gaW4gY2FzZSB3ZSBhcmUgYWN0dWFsbHkgcGFyc2luZyBhIFR5cGVTY3JpcHQgY2xhc3Mgd2l0aCBleGlzdGluZyBkZWNsYXJhdGlvbnNcblx0Y29uc3QgcHJvcGVydHlBY2Nlc3NlcyA9IHBhcnNlUHJvcGVydHlBY2Nlc3NlcyggZmlsZUNsYXNzICk7XG5cdGNvbnN0IGRlc3RydWN0dXJpbmdVc2VzT2ZQcm9wZXJ0aWVzID0gcGFyc2VEZXN0cnVjdHVyaW5nVGhpc0Fzc2lnbm1lbnRzKCBmaWxlQ2xhc3MgKTtcblx0Y29uc3QgcHJvcGVydHlBY2Nlc3Nlc09mVGhpc0Fzc2lnbmVkVmFycyA9IHBhcnNlUHJvcGVydHlBY2Nlc3Nlc09mVGhpc0Fzc2lnbmVkVmFycyggZmlsZUNsYXNzICk7XG5cblx0cmV0dXJuIHVuaW9uKFxuXHRcdGV4aXN0aW5nUHJvcGVydHlEZWNsYXJhdGlvbnMsXG5cdFx0cHJvcGVydHlBY2Nlc3Nlcyxcblx0XHRkZXN0cnVjdHVyaW5nVXNlc09mUHJvcGVydGllcyxcblx0XHRwcm9wZXJ0eUFjY2Vzc2VzT2ZUaGlzQXNzaWduZWRWYXJzXG5cdCk7XG59XG5cblxuLyoqXG4gKiBJbiB0aGUgY2FzZSB0aGF0IHRoZSB1dGlsaXR5IGlzIGFjdHVhbGx5IHBhcnNpbmcgVHlwZVNjcmlwdCBjbGFzc2VzIHdpdGhcbiAqIGV4aXN0aW5nIHByb3BlcnR5IGRlY2xhcmF0aW9ucywgd2Ugd2FudCB0byBrbm93IGFib3V0IHRoZXNlIHNvIHdlIGRvbid0XG4gKiBhY2NpZGVudGFsbHkgd3JpdGUgaW4gbmV3IG9uZXMgb2YgdGhlIHNhbWUgbmFtZS5cbiAqL1xuZnVuY3Rpb24gcGFyc2VQcm9wZXJ0eURlY2xhcmF0aW9ucyggZmlsZUNsYXNzOiBDbGFzc0RlY2xhcmF0aW9uICk6IFNldDxzdHJpbmc+IHtcblx0cmV0dXJuIGZpbGVDbGFzcy5nZXRJbnN0YW5jZVByb3BlcnRpZXMoKVxuXHRcdC5yZWR1Y2UoICggcHJvcHM6IFNldDxzdHJpbmc+LCBwcm9wOiBDbGFzc0luc3RhbmNlUHJvcGVydHlUeXBlcyApID0+IHtcblx0XHRcdGNvbnN0IHByb3BOYW1lID0gcHJvcC5nZXROYW1lKCk7XG5cdFx0XHRyZXR1cm4gcHJvcE5hbWUgPyBwcm9wcy5hZGQoIHByb3BOYW1lICkgOiBwcm9wczsgIC8vIGRvbid0IGFkZCB1bm5hbWVkIHByb3BlcnRpZXMgKG5vdCBzdXJlIGhvdyB3ZSB3b3VsZCBoYXZlIG9uZSBvZiB0aG9zZSwgYnV0IHNlZW1zIGl0cyBwb3NzaWJsZSBhY2NvcmRpbmcgdG8gdGhlIFRzU2ltcGxlQXN0IHR5cGVzKVxuXHRcdH0sIG5ldyBTZXQ8c3RyaW5nPigpICk7XG59XG5cblxuLyoqXG4gKiBQYXJzZXMgdGhlIHByb3BlcnR5IG5hbWVzIG9mIGB0aGlzYCBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb25zLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICB0aGlzLnNvbWV0aGluZyA9IDQyO1xuICogICAgIGNvbnNvbGUubG9nKCB0aGlzLnNvbWV0aGluZzIgKTtcbiAqXG4gKiAgICAgY29uc3QgeyBkZXN0cnVjdHVyZWQxLCBkZXN0cnVjdHVyZWQyIH0gPSB0aGlzO1xuICpcbiAqIE1ldGhvZCByZXR1cm5zOlxuICpcbiAqICAgIFNldCggWyAnc29tZXRoaW5nJywgJ3NvbWV0aGluZzInLCAnZGVzdHJ1Y3R1cmVkMScsICdkZXN0cnVjdHVyZWQyJyBdIClcbiAqL1xuZnVuY3Rpb24gcGFyc2VQcm9wZXJ0eUFjY2Vzc2VzKCBmaWxlQ2xhc3M6IENsYXNzRGVjbGFyYXRpb24gKTogU2V0PHN0cmluZz4ge1xuXHQvLyBGaXJzdCwgZmluZCBhbGwgb2YgdGhlIGB0aGlzLnNvbWV0aGluZ2AgcHJvcGVydGllc1xuXHRjb25zdCB0aGlzUHJvcHMgPSBmaWxlQ2xhc3Ncblx0XHQuZ2V0RGVzY2VuZGFudHNPZktpbmQoIFN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uIClcblx0XHQuZmlsdGVyKCAoIHByb3A6IFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiApID0+IHByb3AuZ2V0RXhwcmVzc2lvbigpLmdldEtpbmQoKSA9PT0gU3ludGF4S2luZC5UaGlzS2V5d29yZCApO1xuXG5cdGNvbnN0IHByb3BOYW1lc1NldCA9IHRoaXNQcm9wc1xuXHRcdC5yZWR1Y2UoICggcHJvcHM6IFNldDxzdHJpbmc+LCBwcm9wOiBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gKSA9PiB7XG5cdFx0XHRyZXR1cm4gcHJvcHMuYWRkKCBwcm9wLmdldE5hbWUoKSApO1xuXHRcdH0sIG5ldyBTZXQ8c3RyaW5nPigpICk7XG5cblx0cmV0dXJuIHByb3BOYW1lc1NldDtcbn1cblxuXG4vKipcbiAqIFBhcnNlcyBhbnkgb2JqZWN0IGRlc3RydWN0dXJpbmcgc3RhdGVtZW50cyBvZiB0aGUgZm9ybTpcbiAqXG4gKiAgICAgdmFyIHsgYSwgYiB9ID0gdGhpcztcbiAqXG4gKiBBbmQgcmV0dXJucyBTZXQoIFsgJ2EnLCAnYicgXSApIGluIHRoaXMgY2FzZS5cbiAqL1xuZnVuY3Rpb24gcGFyc2VEZXN0cnVjdHVyaW5nVGhpc0Fzc2lnbm1lbnRzKCBmaWxlQ2xhc3M6IENsYXNzRGVjbGFyYXRpb24gKTogU2V0PHN0cmluZz4ge1xuXHQvLyBTZWNvbmQsIGZpbmQgYW55IGB2YXIgeyBhLCBiIH0gPSB0aGlzYCBzdGF0ZW1lbnRzXG5cdGNvbnN0IGRlc3RydWN0dXJlZFByb3BzID0gZmlsZUNsYXNzXG5cdFx0LmdldERlc2NlbmRhbnRzT2ZLaW5kKCBTeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb24gKVxuXHRcdC5maWx0ZXIoICggdmFyRGVjOiBWYXJpYWJsZURlY2xhcmF0aW9uICkgPT4ge1xuXHRcdFx0cmV0dXJuIHZhckRlYy5jb21waWxlck5vZGUubmFtZS5raW5kID09PSBTeW50YXhLaW5kLk9iamVjdEJpbmRpbmdQYXR0ZXJuO1xuXHRcdH0gKTtcblxuXHRyZXR1cm4gZGVzdHJ1Y3R1cmVkUHJvcHNcblx0XHQucmVkdWNlKCAoIHByb3BOYW1lczogU2V0PHN0cmluZz4sIHZhckRlYzogVmFyaWFibGVEZWNsYXJhdGlvbiApID0+IHtcblx0XHRcdGNvbnN0IGRlc3RydWN0dXJlZFByb3BOYW1lcyA9IHBhcnNlRGVzdHJ1Y3R1cmVkUHJvcHMoIHZhckRlYy5jb21waWxlck5vZGUubmFtZSBhcyB0cy5PYmplY3RCaW5kaW5nUGF0dGVybiApO1xuXHRcdFx0ZGVzdHJ1Y3R1cmVkUHJvcE5hbWVzLmZvckVhY2goIHByb3BOYW1lID0+IHByb3BOYW1lcy5hZGQoIHByb3BOYW1lICkgKTtcblxuXHRcdFx0cmV0dXJuIHByb3BOYW1lcztcblx0XHR9LCBuZXcgU2V0PHN0cmluZz4oKSApO1xufVxuXG5cbi8qKlxuICogUGFyc2VzIHByb3BlcnR5IGFjY2Vzc2VzIG9mIHZhcmlhYmxlcyB0aGF0IGFyZSBhc3NpZ25lZCB0byB0aGUgYHRoaXNgXG4gKiBrZXl3b3JkLlxuICpcbiAqIEZvciBleGFtcGxlOlxuICpcbiAqICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gKlxuICogICAgIHRoYXQuc29tZVByb3AxID0gMTtcbiAqICAgICB0aGF0LnNvbWVQcm9wMiA9IDI7XG4gKlxuICogSW4gdGhlIGFib3ZlIGNvZGUsIHRoZSBTZXQoIFsgJ3NvbWVQcm9wMScsICdzb21lUHJvcDInIF0gKSBpcyByZXR1cm5lZFxuICovXG5mdW5jdGlvbiBwYXJzZVByb3BlcnR5QWNjZXNzZXNPZlRoaXNBc3NpZ25lZFZhcnMoXG5cdGZpbGVDbGFzczogQ2xhc3NEZWNsYXJhdGlvblxuKTogU2V0PHN0cmluZz4ge1xuXHRjb25zdCBtZXRob2RzID0gZmlsZUNsYXNzLmdldE1ldGhvZHMoKTtcblxuXHRyZXR1cm4gbWV0aG9kcy5yZWR1Y2UoICggcHJvcE5hbWVzOiBTZXQ8c3RyaW5nPiwgbWV0aG9kOiBNZXRob2REZWNsYXJhdGlvbiApID0+IHtcblx0XHRjb25zdCB0aGlzVmFyRGVjbGFyYXRpb25zID0gbWV0aG9kXG5cdFx0XHQuZ2V0RGVzY2VuZGFudHNPZktpbmQoIFN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbiApXG5cdFx0XHQuZmlsdGVyKCBpc1RoaXNSZWZlcmVuY2luZ1ZhciApO1xuXG5cdFx0Ly8gR2V0IHRoZSBhcnJheSBvZiBpZGVudGlmaWVycyBhc3NpZ25lZCB0byBgdGhpc2AuIEV4OiBbICd0aGF0JywgJ3NlbGYnIF1cblx0XHRjb25zdCB0aGlzVmFySWRlbnRpZmllcnMgPSB0aGlzVmFyRGVjbGFyYXRpb25zXG5cdFx0XHQubWFwKCAoIHRoaXNWYXJEZWM6IFZhcmlhYmxlRGVjbGFyYXRpb24gKSA9PiB0aGlzVmFyRGVjLmdldE5hbWUoKSApO1xuXG5cdFx0dGhpc1ZhcklkZW50aWZpZXJzLmZvckVhY2goICggdGhpc1ZhcklkZW50aWZpZXI6IHN0cmluZyApID0+IHtcblx0XHRcdC8vIEdldCB0aGUgcHJvcGVydGllcyBhY2Nlc3NlZCBmcm9tIHRoZSBgdGhpc2AgaWRlbnRpZmllcnMgKGkuZS4gZnJvbVxuXHRcdFx0Ly8gJ3RoYXQnLCAnc2VsZicsIGV0Yy4pXG5cdFx0XHRjb25zdCBwcm9wTmFtZXNBY2Nlc3NlZEZyb21JZGVudGlmaWVyID0gbWV0aG9kXG5cdFx0XHRcdC5nZXREZXNjZW5kYW50c09mS2luZCggU3ludGF4S2luZC5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gKVxuXHRcdFx0XHQuZmlsdGVyKCBwcm9wZXJ0eUFjY2Vzc1dpdGhPYmpGaWx0ZXIoIHRoaXNWYXJJZGVudGlmaWVyICkgKVxuXHRcdFx0XHQubWFwKCAoIHA6IFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiApID0+IHAuZ2V0TmFtZSgpICk7XG5cblx0XHRcdHByb3BOYW1lc0FjY2Vzc2VkRnJvbUlkZW50aWZpZXJcblx0XHRcdFx0LmZvckVhY2goICggcHJvcE5hbWU6IHN0cmluZyApID0+IHByb3BOYW1lcy5hZGQoIHByb3BOYW1lICkgKTtcblx0XHR9ICk7XG5cblx0XHRyZXR1cm4gcHJvcE5hbWVzO1xuXHR9LCBuZXcgU2V0PHN0cmluZz4oKSApO1xufSJdfQ==