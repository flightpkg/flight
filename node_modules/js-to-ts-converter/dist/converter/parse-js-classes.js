"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_simple_ast_1 = require("ts-simple-ast");
const js_class_1 = require("../model/js-class");
const set_utils_1 = require("../util/set-utils");
const parse_destructured_props_1 = require("../util/parse-destructured-props");
const parse_superclass_name_and_path_1 = require("../util/parse-superclass-name-and-path");
const is_this_referencing_var_1 = require("../util/is-this-referencing-var");
const is_property_access_with_obj_1 = require("../util/is-property-access-with-obj");
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
    const files = tsAstProject.getSourceFiles();
    const jsClasses = files.reduce((classes, file) => {
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
        const { superclassName, superclassPath } = parse_superclass_name_and_path_1.parseSuperclassNameAndPath(sourceFile, fileClass);
        const methodNames = getMethodNames(fileClass);
        const propertyNames = getPropertyNames(fileClass);
        const propertiesMinusMethods = set_utils_1.difference(propertyNames, methodNames); // remove any method names from this Set
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
    return set_utils_1.union(existingPropertyDeclarations, propertyAccesses, destructuringUsesOfProperties, propertyAccessesOfThisAssignedVars);
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
        .getDescendantsOfKind(ts_simple_ast_1.SyntaxKind.PropertyAccessExpression)
        .filter(prop => prop.getExpression().getKind() === ts_simple_ast_1.SyntaxKind.ThisKeyword);
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
        .getDescendantsOfKind(ts_simple_ast_1.SyntaxKind.VariableDeclaration)
        .filter((varDec) => {
        return varDec.compilerNode.name.kind === ts_simple_ast_1.SyntaxKind.ObjectBindingPattern;
    });
    return destructuredProps
        .reduce((propNames, varDec) => {
        const destructuredPropNames = parse_destructured_props_1.parseDestructuredProps(varDec.compilerNode.name);
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
            .getDescendantsOfKind(ts_simple_ast_1.SyntaxKind.VariableDeclaration)
            .filter(is_this_referencing_var_1.isThisReferencingVar);
        // Get the array of identifiers assigned to `this`. Ex: [ 'that', 'self' ]
        const thisVarIdentifiers = thisVarDeclarations
            .map((thisVarDec) => thisVarDec.getName());
        thisVarIdentifiers.forEach((thisVarIdentifier) => {
            // Get the properties accessed from the `this` identifiers (i.e. from
            // 'that', 'self', etc.)
            const propNamesAccessedFromIdentifier = method
                .getDescendantsOfKind(ts_simple_ast_1.SyntaxKind.PropertyAccessExpression)
                .filter(is_property_access_with_obj_1.propertyAccessWithObjFilter(thisVarIdentifier))
                .map((p) => p.getName());
            propNamesAccessedFromIdentifier
                .forEach((propName) => propNames.add(propName));
        });
        return propNames;
    }, new Set());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UtanMtY2xhc3Nlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb252ZXJ0ZXIvcGFyc2UtanMtY2xhc3Nlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUE4TjtBQUM5TixnREFBNEM7QUFDNUMsaURBQXNEO0FBQ3RELCtFQUEwRTtBQUMxRSwyRkFBb0Y7QUFDcEYsNkVBQXVFO0FBQ3ZFLHFGQUFrRjtBQUVsRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQStCRztBQUNILHdCQUFnQyxZQUFxQjtJQUNwRCxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7SUFFNUMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBRSxDQUFFLE9BQWtCLEVBQUUsSUFBZ0IsRUFBRyxFQUFFO1FBQzFFLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFFLElBQUksQ0FBRSxDQUFDO1FBQzdDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBRSxXQUFXLENBQUUsQ0FBQztJQUN0QyxDQUFDLEVBQUUsRUFBRSxDQUFFLENBQUM7SUFFUixPQUFPLFNBQVMsQ0FBQztBQUNsQixDQUFDO0FBVEQsd0NBU0M7QUFHRDs7R0FFRztBQUNILDBCQUEyQixVQUFzQjtJQUNoRCxPQUFPLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUUsU0FBUyxDQUFDLEVBQUU7UUFDL0MsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RDLE1BQU0sRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEdBQUcsMkRBQTBCLENBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBRSxDQUFDO1FBQy9GLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBRSxTQUFTLENBQUUsQ0FBQztRQUNoRCxNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBRSxTQUFTLENBQUUsQ0FBQztRQUVwRCxNQUFNLHNCQUFzQixH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QUUsQ0FBQztZQUV4RCwrQkFBK0I7aUJBQzdCLE9BQU8sQ0FBRSxDQUFFLFFBQWdCLEVBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUUsUUFBUSxDQUFFLENBQUUsQ0FBQztRQUNoRSxDQUFDLENBQUUsQ0FBQztRQUVKLE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBVSxDQUFFLENBQUM7QUFDeEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9qZWN0LCB7IHRzLCBDbGFzc0RlY2xhcmF0aW9uLCBDbGFzc0luc3RhbmNlUHJvcGVydHlUeXBlcywgSW1wb3J0RGVjbGFyYXRpb24sIEltcG9ydFNwZWNpZmllciwgTWV0aG9kRGVjbGFyYXRpb24sIE5vZGUsIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiwgU291cmNlRmlsZSwgU3ludGF4S2luZCwgVmFyaWFibGVEZWNsYXJhdGlvbiB9IGZyb20gXCJ0cy1zaW1wbGUtYXN0XCI7XG5pbXBvcnQgeyBKc0NsYXNzIH0gZnJvbSBcIi4uL21vZGVsL2pzLWNsYXNzXCI7XG5pbXBvcnQgeyBkaWZmZXJlbmNlLCB1bmlvbiB9IGZyb20gXCIuLi91dGlsL3NldC11dGlsc1wiO1xuaW1wb3J0IHsgcGFyc2VEZXN0cnVjdHVyZWRQcm9wcyB9IGZyb20gXCIuLi91dGlsL3BhcnNlLWRlc3RydWN0dXJlZC1wcm9wc1wiO1xuaW1wb3J0IHsgcGFyc2VTdXBlcmNsYXNzTmFtZUFuZFBhdGggfSBmcm9tIFwiLi4vdXRpbC9wYXJzZS1zdXBlcmNsYXNzLW5hbWUtYW5kLXBhdGhcIjtcbmltcG9ydCB7IGlzVGhpc1JlZmVyZW5jaW5nVmFyIH0gZnJvbSBcIi4uL3V0aWwvaXMtdGhpcy1yZWZlcmVuY2luZy12YXJcIjtcbmltcG9ydCB7IHByb3BlcnR5QWNjZXNzV2l0aE9iakZpbHRlciB9IGZyb20gXCIuLi91dGlsL2lzLXByb3BlcnR5LWFjY2Vzcy13aXRoLW9ialwiO1xuXG4vKipcbiAqIFBhcnNlcyB0aGUgY2xhc3NlcyBvdXQgb2YgZWFjaCAuanMgZmlsZSBpbiB0aGUgU291cmNlRmlsZXNDb2xsZWN0aW9uLCBhbmRcbiAqIGZvcm1zIGEgdHJlZSByZXByZXNlbnRpbmcgdGhlaXIgaGllcmFyY2h5LlxuICpcbiAqICMjIERlc2NyaXB0aW9uIG9mIGFsZ29yaXRobTpcbiAqXG4gKiBFYWNoIHNvdXJjZSBmaWxlIGlzIHBhcnNlZCB0byBmaW5kIGFsbCBmaWxlLWxldmVsIGNsYXNzZXMuIFRoZWlyIHN1cGVyY2xhc3Nlc1xuICogYW5kIGltcG9ydCBwYXRocyBmb3IgdGhvc2Ugc3VwZXJjbGFzc2VzIGFyZSBhbHNvIHJlY29yZGVkIHRvIGZvcm0gYW5cbiAqIGFkamFjZW5jeSBsaXN0IGdyYXBoIG9mIGNsYXNzZXMga2V5ZWQgYnkgdGhlaXIgZmlsZSBwYXRoLlxuICpcbiAqIEVhY2ggY2xhc3MgaXMgYWxzbyBwcm9jZXNzZWQgdG8gZmluZCBhbmQgcmVjb3JkIGFueSBwcm9wZXJ0eSBhY2Nlc3NlcyBvZiB0aGVcbiAqIGB0aGlzYCBvYmplY3QuIEZvciBpbnN0YW5jZSwgaW4gdGhlIGZvbGxvd2luZyBjbGFzcywgdGhlcmUgYXJlIDNcbiAqIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbnMgdGhhdCBwdWxsIGZyb20gdGhlIGB0aGlzYCBvYmplY3QgKCdzb21ldGhpbmcxJyxcbiAqICdzb21ldGhpbmcyJywgYW5kICdzb21ldGhpbmczJyk6XG4gKlxuICogICAgIGNsYXNzIFNvbWV0aGluZyB7XG4gKiAgICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgICAgICAgICAgdGhpcy5zb21ldGhpbmcxID0gMTtcbiAqICAgICAgICAgICAgIHRoaXMuc29tZXRoaW5nMiA9IDI7XG4gKiAgICAgICAgIH1cbiAqXG4gKiAgICAgICAgIHNvbWVNZXRob2QoKSB7XG4gKiAgICAgICAgICAgICBjb25zb2xlLmxvZyggdGhpcy5zb21ldGhpbmczICk7XG4gKlxuICogICAgICAgICAgICAgY29uc29sZS5sb2coIHdpbmRvdy5sb2NhdGlvbiApOyAgLy8gPC0tIG5vdCBhIGB0aGlzYCBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb25cbiAqICAgICAgICAgfVxuICogICAgIH1cbiAqXG4gKiBUaGUgcmV0dXJuZWQgZ3JhcGggd2lsbCBiZSB1c2VkIGxhdGVyIHRvIGRldGVybWluZSB3aGljaCBUUyBjbGFzcyBwcm9wZXJ0eVxuICogZGVmaW5pdGlvbnMgc2hvdWxkIGJlIHBsYWNlZCBpbiBzdXBlcmNsYXNzZXMgdnMuIHN1YmNsYXNzZXMuIFByb3BlcnRpZXMgdXNlZFxuICogYnkgYSBzdXBlcmNsYXNzIGFuZCBhIHN1YmNsYXNzIHNob3VsZCBvbmx5IGJlIGRlZmluZWQgaW4gdGhlIHN1cGVyY2xhc3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUpzQ2xhc3NlcyggdHNBc3RQcm9qZWN0OiBQcm9qZWN0ICk6IEpzQ2xhc3NbXSB7XG5cdGNvbnN0IGZpbGVzID0gdHNBc3RQcm9qZWN0LmdldFNvdXJjZUZpbGVzKCk7XG5cblx0Y29uc3QganNDbGFzc2VzID0gZmlsZXMucmVkdWNlKCAoIGNsYXNzZXM6IEpzQ2xhc3NbXSwgZmlsZTogU291cmNlRmlsZSApID0+IHtcblx0XHRjb25zdCBmaWxlQ2xhc3NlcyA9IHBhcnNlRmlsZUNsYXNzZXMoIGZpbGUgKTtcblx0XHRyZXR1cm4gY2xhc3Nlcy5jb25jYXQoIGZpbGVDbGFzc2VzICk7XG5cdH0sIFtdICk7XG5cblx0cmV0dXJuIGpzQ2xhc3Nlcztcbn1cblxuXG4vKipcbiAqIFBhcnNlcyB0aGUgZmlsZS1sZXZlbCBjbGFzc2VzIG91dCBvZiB0aGUgZ2l2ZW4gYHNvdXJjZUZpbGVgLlxuICovXG5mdW5jdGlvbiBwYXJzZUZpbGVDbGFzc2VzKCBzb3VyY2VGaWxlOiBTb3VyY2VGaWxlICk6IEpzQ2xhc3NbXSB7XG5cdHJldHVybiBzb3VyY2VGaWxlLmdldENsYXNzZXMoKS5tYXAoIGZpbGVDbGFzcyA9PiB7XG5cdFx0Y29uc3QgY2xhc3NOYW1lID0gZmlsZUNsYXNzLmdldE5hbWUoKTtcblx0XHRjb25zdCB7IHN1cGVyY2xhc3NOYW1lLCBzdXBlcmNsYXNzUGF0aCB9ID0gcGFyc2VTdXBlcmNsYXNzTmFtZUFuZFBhdGgoIHNvdXJjZUZpbGUsIGZpbGVDbGFzcyApO1xuXHRcdGNvbnN0IG1ldGhvZE5hbWVzID0gZ2V0TWV0aG9kTmFtZXMoIGZpbGVDbGFzcyApO1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZXMgPSBnZXRQcm9wZXJ0eU5hbWVzKCBmaWxlQ2xhc3MgKTtcblxuXHRcdGNvbnN0IHByb3BlcnRpZXNNaW51c01ldGhvZHMgPSBkaWZmZXJlbmNlKCBwcm9wZXJ0eU5hbWVzLCBtZXRob2ROYW1lcyApOyAgLy8gcmVtb3ZlIGFueSBtZXRob2QgbmFtZXMgZnJvbSB0aGlzIFNldFxuXG5cdFx0cmV0dXJuIG5ldyBKc0NsYXNzKCB7XG5cdFx0XHRwYXRoOiBzb3VyY2VGaWxlLmdldEZpbGVQYXRoKCksXG5cdFx0XHRuYW1lOiBjbGFzc05hbWUsXG5cdFx0XHRzdXBlcmNsYXNzTmFtZSxcblx0XHRcdHN1cGVyY2xhc3NQYXRoLFxuXHRcdFx0bWV0aG9kczogbWV0aG9kTmFtZXMsXG5cdFx0XHRwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzTWludXNNZXRob2RzXG5cdFx0fSApO1xuXHR9ICk7XG59XG5cblxuLyoqXG4gKiBQYXJzZXMgdGhlIG1ldGhvZCBuYW1lcyBmcm9tIHRoZSBjbGFzcyBpbnRvIGEgU2V0IG9mIHN0cmluZ3MuXG4gKi9cbmZ1bmN0aW9uIGdldE1ldGhvZE5hbWVzKCBmaWxlQ2xhc3M6IENsYXNzRGVjbGFyYXRpb24gKTogU2V0PHN0cmluZz4ge1xuXHRyZXR1cm4gZmlsZUNsYXNzLmdldE1ldGhvZHMoKVxuXHRcdC5yZWR1Y2UoICggbWV0aG9kczogU2V0PHN0cmluZz4sIG1ldGhvZDogTWV0aG9kRGVjbGFyYXRpb24gKSA9PiB7XG5cdFx0XHRyZXR1cm4gbWV0aG9kcy5hZGQoIG1ldGhvZC5nZXROYW1lKCkgKTtcblx0XHR9LCBuZXcgU2V0PHN0cmluZz4oKSApO1xufVxuXG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBsaXN0IG9mIHByb3BlcnR5TmFtZXMgdXNlZCBpbiB0aGUgY2xhc3MuIFRoaXMgbWF5IGFsc28gaW5jbHVkZVxuICogbWV0aG9kIG5hbWVzICh3aGljaCBhcmUgdGVjaG5pY2FsbHkgcHJvcGVydGllcyksIHdoaWNoIHdlJ2xsIGZpbHRlciBvdXQgbGF0ZXIuXG4gKi9cbmZ1bmN0aW9uIGdldFByb3BlcnR5TmFtZXMoIGZpbGVDbGFzczogQ2xhc3NEZWNsYXJhdGlvbiApIHtcblx0Y29uc3QgZXhpc3RpbmdQcm9wZXJ0eURlY2xhcmF0aW9ucyA9IHBhcnNlUHJvcGVydHlEZWNsYXJhdGlvbnMoIGZpbGVDbGFzcyApOyAgLy8gaW4gY2FzZSB3ZSBhcmUgYWN0dWFsbHkgcGFyc2luZyBhIFR5cGVTY3JpcHQgY2xhc3Mgd2l0aCBleGlzdGluZyBkZWNsYXJhdGlvbnNcblx0Y29uc3QgcHJvcGVydHlBY2Nlc3NlcyA9IHBhcnNlUHJvcGVydHlBY2Nlc3NlcyggZmlsZUNsYXNzICk7XG5cdGNvbnN0IGRlc3RydWN0dXJpbmdVc2VzT2ZQcm9wZXJ0aWVzID0gcGFyc2VEZXN0cnVjdHVyaW5nVGhpc0Fzc2lnbm1lbnRzKCBmaWxlQ2xhc3MgKTtcblx0Y29uc3QgcHJvcGVydHlBY2Nlc3Nlc09mVGhpc0Fzc2lnbmVkVmFycyA9IHBhcnNlUHJvcGVydHlBY2Nlc3Nlc09mVGhpc0Fzc2lnbmVkVmFycyggZmlsZUNsYXNzICk7XG5cblx0cmV0dXJuIHVuaW9uKFxuXHRcdGV4aXN0aW5nUHJvcGVydHlEZWNsYXJhdGlvbnMsXG5cdFx0cHJvcGVydHlBY2Nlc3Nlcyxcblx0XHRkZXN0cnVjdHVyaW5nVXNlc09mUHJvcGVydGllcyxcblx0XHRwcm9wZXJ0eUFjY2Vzc2VzT2ZUaGlzQXNzaWduZWRWYXJzXG5cdCk7XG59XG5cblxuLyoqXG4gKiBJbiB0aGUgY2FzZSB0aGF0IHRoZSB1dGlsaXR5IGlzIGFjdHVhbGx5IHBhcnNpbmcgVHlwZVNjcmlwdCBjbGFzc2VzIHdpdGhcbiAqIGV4aXN0aW5nIHByb3BlcnR5IGRlY2xhcmF0aW9ucywgd2Ugd2FudCB0byBrbm93IGFib3V0IHRoZXNlIHNvIHdlIGRvbid0XG4gKiBhY2NpZGVudGFsbHkgd3JpdGUgaW4gbmV3IG9uZXMgb2YgdGhlIHNhbWUgbmFtZS5cbiAqL1xuZnVuY3Rpb24gcGFyc2VQcm9wZXJ0eURlY2xhcmF0aW9ucyggZmlsZUNsYXNzOiBDbGFzc0RlY2xhcmF0aW9uICk6IFNldDxzdHJpbmc+IHtcblx0cmV0dXJuIGZpbGVDbGFzcy5nZXRJbnN0YW5jZVByb3BlcnRpZXMoKVxuXHRcdC5yZWR1Y2UoICggcHJvcHM6IFNldDxzdHJpbmc+LCBwcm9wOiBDbGFzc0luc3RhbmNlUHJvcGVydHlUeXBlcyApID0+IHtcblx0XHRcdGNvbnN0IHByb3BOYW1lID0gcHJvcC5nZXROYW1lKCk7XG5cdFx0XHRyZXR1cm4gcHJvcE5hbWUgPyBwcm9wcy5hZGQoIHByb3BOYW1lICkgOiBwcm9wczsgIC8vIGRvbid0IGFkZCB1bm5hbWVkIHByb3BlcnRpZXMgKG5vdCBzdXJlIGhvdyB3ZSB3b3VsZCBoYXZlIG9uZSBvZiB0aG9zZSwgYnV0IHNlZW1zIGl0cyBwb3NzaWJsZSBhY2NvcmRpbmcgdG8gdGhlIFRzU2ltcGxlQXN0IHR5cGVzKVxuXHRcdH0sIG5ldyBTZXQ8c3RyaW5nPigpICk7XG59XG5cblxuLyoqXG4gKiBQYXJzZXMgdGhlIHByb3BlcnR5IG5hbWVzIG9mIGB0aGlzYCBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb25zLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICB0aGlzLnNvbWV0aGluZyA9IDQyO1xuICogICAgIGNvbnNvbGUubG9nKCB0aGlzLnNvbWV0aGluZzIgKTtcbiAqXG4gKiAgICAgY29uc3QgeyBkZXN0cnVjdHVyZWQxLCBkZXN0cnVjdHVyZWQyIH0gPSB0aGlzO1xuICpcbiAqIE1ldGhvZCByZXR1cm5zOlxuICpcbiAqICAgIFNldCggWyAnc29tZXRoaW5nJywgJ3NvbWV0aGluZzInLCAnZGVzdHJ1Y3R1cmVkMScsICdkZXN0cnVjdHVyZWQyJyBdIClcbiAqL1xuZnVuY3Rpb24gcGFyc2VQcm9wZXJ0eUFjY2Vzc2VzKCBmaWxlQ2xhc3M6IENsYXNzRGVjbGFyYXRpb24gKTogU2V0PHN0cmluZz4ge1xuXHQvLyBGaXJzdCwgZmluZCBhbGwgb2YgdGhlIGB0aGlzLnNvbWV0aGluZ2AgcHJvcGVydGllc1xuXHRjb25zdCB0aGlzUHJvcHMgPSBmaWxlQ2xhc3Ncblx0XHQuZ2V0RGVzY2VuZGFudHNPZktpbmQoIFN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uIClcblx0XHQuZmlsdGVyKCBwcm9wID0+IHByb3AuZ2V0RXhwcmVzc2lvbigpLmdldEtpbmQoKSA9PT0gU3ludGF4S2luZC5UaGlzS2V5d29yZCApO1xuXG5cdGNvbnN0IHByb3BOYW1lc1NldCA9IHRoaXNQcm9wc1xuXHRcdC5yZWR1Y2UoICggcHJvcHM6IFNldDxzdHJpbmc+LCBwcm9wOiBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gKSA9PiB7XG5cdFx0XHRyZXR1cm4gcHJvcHMuYWRkKCBwcm9wLmdldE5hbWUoKSApO1xuXHRcdH0sIG5ldyBTZXQ8c3RyaW5nPigpICk7XG5cblx0cmV0dXJuIHByb3BOYW1lc1NldDtcbn1cblxuXG4vKipcbiAqIFBhcnNlcyBhbnkgb2JqZWN0IGRlc3RydWN0dXJpbmcgc3RhdGVtZW50cyBvZiB0aGUgZm9ybTpcbiAqXG4gKiAgICAgdmFyIHsgYSwgYiB9ID0gdGhpcztcbiAqXG4gKiBBbmQgcmV0dXJucyBTZXQoIFsgJ2EnLCAnYicgXSApIGluIHRoaXMgY2FzZS5cbiAqL1xuZnVuY3Rpb24gcGFyc2VEZXN0cnVjdHVyaW5nVGhpc0Fzc2lnbm1lbnRzKCBmaWxlQ2xhc3M6IENsYXNzRGVjbGFyYXRpb24gKTogU2V0PHN0cmluZz4ge1xuXHQvLyBTZWNvbmQsIGZpbmQgYW55IGB2YXIgeyBhLCBiIH0gPSB0aGlzYCBzdGF0ZW1lbnRzXG5cdGNvbnN0IGRlc3RydWN0dXJlZFByb3BzID0gZmlsZUNsYXNzXG5cdFx0LmdldERlc2NlbmRhbnRzT2ZLaW5kKCBTeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb24gKVxuXHRcdC5maWx0ZXIoICggdmFyRGVjOiBWYXJpYWJsZURlY2xhcmF0aW9uICkgPT4ge1xuXHRcdFx0cmV0dXJuIHZhckRlYy5jb21waWxlck5vZGUubmFtZS5raW5kID09PSBTeW50YXhLaW5kLk9iamVjdEJpbmRpbmdQYXR0ZXJuO1xuXHRcdH0gKTtcblxuXHRyZXR1cm4gZGVzdHJ1Y3R1cmVkUHJvcHNcblx0XHQucmVkdWNlKCAoIHByb3BOYW1lczogU2V0PHN0cmluZz4sIHZhckRlYzogVmFyaWFibGVEZWNsYXJhdGlvbiApID0+IHtcblx0XHRcdGNvbnN0IGRlc3RydWN0dXJlZFByb3BOYW1lcyA9IHBhcnNlRGVzdHJ1Y3R1cmVkUHJvcHMoIHZhckRlYy5jb21waWxlck5vZGUubmFtZSBhcyB0cy5PYmplY3RCaW5kaW5nUGF0dGVybiApO1xuXHRcdFx0ZGVzdHJ1Y3R1cmVkUHJvcE5hbWVzLmZvckVhY2goIHByb3BOYW1lID0+IHByb3BOYW1lcy5hZGQoIHByb3BOYW1lICkgKTtcblxuXHRcdFx0cmV0dXJuIHByb3BOYW1lcztcblx0XHR9LCBuZXcgU2V0PHN0cmluZz4oKSApO1xufVxuXG5cbi8qKlxuICogUGFyc2VzIHByb3BlcnR5IGFjY2Vzc2VzIG9mIHZhcmlhYmxlcyB0aGF0IGFyZSBhc3NpZ25lZCB0byB0aGUgYHRoaXNgXG4gKiBrZXl3b3JkLlxuICpcbiAqIEZvciBleGFtcGxlOlxuICpcbiAqICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gKlxuICogICAgIHRoYXQuc29tZVByb3AxID0gMTtcbiAqICAgICB0aGF0LnNvbWVQcm9wMiA9IDI7XG4gKlxuICogSW4gdGhlIGFib3ZlIGNvZGUsIHRoZSBTZXQoIFsgJ3NvbWVQcm9wMScsICdzb21lUHJvcDInIF0gKSBpcyByZXR1cm5lZFxuICovXG5mdW5jdGlvbiBwYXJzZVByb3BlcnR5QWNjZXNzZXNPZlRoaXNBc3NpZ25lZFZhcnMoXG5cdGZpbGVDbGFzczogQ2xhc3NEZWNsYXJhdGlvblxuKTogU2V0PHN0cmluZz4ge1xuXHRjb25zdCBtZXRob2RzID0gZmlsZUNsYXNzLmdldE1ldGhvZHMoKTtcblxuXHRyZXR1cm4gbWV0aG9kcy5yZWR1Y2UoICggcHJvcE5hbWVzOiBTZXQ8c3RyaW5nPiwgbWV0aG9kOiBNZXRob2REZWNsYXJhdGlvbiApID0+IHtcblx0XHRjb25zdCB0aGlzVmFyRGVjbGFyYXRpb25zID0gbWV0aG9kXG5cdFx0XHQuZ2V0RGVzY2VuZGFudHNPZktpbmQoIFN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbiApXG5cdFx0XHQuZmlsdGVyKCBpc1RoaXNSZWZlcmVuY2luZ1ZhciApO1xuXG5cdFx0Ly8gR2V0IHRoZSBhcnJheSBvZiBpZGVudGlmaWVycyBhc3NpZ25lZCB0byBgdGhpc2AuIEV4OiBbICd0aGF0JywgJ3NlbGYnIF1cblx0XHRjb25zdCB0aGlzVmFySWRlbnRpZmllcnMgPSB0aGlzVmFyRGVjbGFyYXRpb25zXG5cdFx0XHQubWFwKCAoIHRoaXNWYXJEZWM6IFZhcmlhYmxlRGVjbGFyYXRpb24gKSA9PiB0aGlzVmFyRGVjLmdldE5hbWUoKSApO1xuXG5cdFx0dGhpc1ZhcklkZW50aWZpZXJzLmZvckVhY2goICggdGhpc1ZhcklkZW50aWZpZXI6IHN0cmluZyApID0+IHtcblx0XHRcdC8vIEdldCB0aGUgcHJvcGVydGllcyBhY2Nlc3NlZCBmcm9tIHRoZSBgdGhpc2AgaWRlbnRpZmllcnMgKGkuZS4gZnJvbVxuXHRcdFx0Ly8gJ3RoYXQnLCAnc2VsZicsIGV0Yy4pXG5cdFx0XHRjb25zdCBwcm9wTmFtZXNBY2Nlc3NlZEZyb21JZGVudGlmaWVyID0gbWV0aG9kXG5cdFx0XHRcdC5nZXREZXNjZW5kYW50c09mS2luZCggU3ludGF4S2luZC5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gKVxuXHRcdFx0XHQuZmlsdGVyKCBwcm9wZXJ0eUFjY2Vzc1dpdGhPYmpGaWx0ZXIoIHRoaXNWYXJJZGVudGlmaWVyICkgKVxuXHRcdFx0XHQubWFwKCAoIHA6IFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiApID0+IHAuZ2V0TmFtZSgpICk7XG5cblx0XHRcdHByb3BOYW1lc0FjY2Vzc2VkRnJvbUlkZW50aWZpZXJcblx0XHRcdFx0LmZvckVhY2goICggcHJvcE5hbWU6IHN0cmluZyApID0+IHByb3BOYW1lcy5hZGQoIHByb3BOYW1lICkgKTtcblx0XHR9ICk7XG5cblx0XHRyZXR1cm4gcHJvcE5hbWVzO1xuXHR9LCBuZXcgU2V0PHN0cmluZz4oKSApO1xufSJdfQ==