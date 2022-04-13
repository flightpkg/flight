"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addClassPropertyDeclarations = void 0;
const ts_morph_1 = require("ts-morph");
const parse_js_classes_1 = require("./parse-js-classes");
const correct_js_properties_1 = require("./correct-js-properties");
const logger_1 = __importDefault(require("../../logger/logger"));
/**
 * Parses all source files looking for ES6 classes, and takes any `this`
 * property access to create a PropertyDeclaration for the class.
 *
 * For example:
 *
 *     class Something {
 *         constructor() {
 *             this.someProp = 1;
 *         }
 *     }
 *
 * Is changed to:
 *
 *     class Something {
 *         someProp: any;
 *
 *         constructor() {
 *             this.someProp = 1;
 *         }
 *     }
 */
function addClassPropertyDeclarations(tsAstProject) {
    // Parse the JS classes for all of the this.xyz properties that they use
    const jsClasses = (0, parse_js_classes_1.parseJsClasses)(tsAstProject);
    // Correct the JS classes' properties for superclass/subclass relationships
    // (essentially remove properties from subclasses that are defined by their
    // superclasses)
    const propertiesCorrectedJsClasses = (0, correct_js_properties_1.correctJsProperties)(jsClasses);
    // Fill in field definitions for each of the classes
    propertiesCorrectedJsClasses.forEach(jsClass => {
        const sourceFile = tsAstProject.getSourceFileOrThrow(jsClass.path);
        logger_1.default.verbose(`  Updating class '${jsClass.name}' in '${sourceFile.getFilePath()}'`);
        const classDeclaration = sourceFile.getClassOrThrow(jsClass.name);
        const jsClassProperties = jsClass.properties;
        // If the utility was run against a TypeScript codebase, we should not
        // fill in property declarations for properties that are already
        // declared in the class. However, we *should* fill in any missing
        // declarations. Removing any already-declared declarations from the
        // jsClassProperties.
        const currentPropertyDeclarations = classDeclaration.getInstanceProperties()
            .reduce((props, prop) => {
            const propName = prop.getName();
            return propName ? props.add(propName) : props;
        }, new Set());
        let undeclaredProperties = [...jsClassProperties]
            .filter((propName) => !currentPropertyDeclarations.has(propName));
        // If the utility found a reference to this.constructor, we don't want to
        // add a property called 'constructor'. Filter that out now.
        // https://github.com/gregjacobs/js-to-ts-converter/issues/9
        undeclaredProperties = undeclaredProperties
            .filter((propName) => propName !== 'constructor');
        // Add all currently-undeclared properties
        const propertyDeclarations = undeclaredProperties.map(propertyName => {
            return {
                name: propertyName,
                type: 'any',
                scope: ts_morph_1.Scope.Public
            };
        });
        logger_1.default.verbose(`    Adding property declarations for properties: '${undeclaredProperties.join("', '")}'`);
        classDeclaration.insertProperties(0, propertyDeclarations);
    });
    return tsAstProject;
}
exports.addClassPropertyDeclarations = addClassPropertyDeclarations;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLWNsYXNzLXByb3BlcnR5LWRlY2xhcmF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb252ZXJ0ZXIvYWRkLWNsYXNzLXByb3BlcnR5LWRlY2xhcmF0aW9ucy9hZGQtY2xhc3MtcHJvcGVydHktZGVjbGFyYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHVDQUFvRztBQUNwRyx5REFBb0Q7QUFDcEQsbUVBQThEO0FBQzlELGlFQUF5QztBQUV6Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBQ0gsU0FBZ0IsNEJBQTRCLENBQUUsWUFBcUI7SUFDbEUsd0VBQXdFO0lBQ3hFLE1BQU0sU0FBUyxHQUFHLElBQUEsaUNBQWMsRUFBRSxZQUFZLENBQUUsQ0FBQztJQUVqRCwyRUFBMkU7SUFDM0UsMkVBQTJFO0lBQzNFLGdCQUFnQjtJQUNoQixNQUFNLDRCQUE0QixHQUFHLElBQUEsMkNBQW1CLEVBQUUsU0FBUyxDQUFFLENBQUM7SUFFdEUsb0RBQW9EO0lBQ3BELDRCQUE0QixDQUFDLE9BQU8sQ0FBRSxPQUFPLENBQUMsRUFBRTtRQUMvQyxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsb0JBQW9CLENBQUUsT0FBTyxDQUFDLElBQUksQ0FBRSxDQUFDO1FBQ3JFLGdCQUFNLENBQUMsT0FBTyxDQUFFLHFCQUFxQixPQUFPLENBQUMsSUFBSSxTQUFTLFVBQVUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFFLENBQUM7UUFFeEYsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFFLE9BQU8sQ0FBQyxJQUFLLENBQUUsQ0FBQztRQUNyRSxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFFN0Msc0VBQXNFO1FBQ3RFLGdFQUFnRTtRQUNoRSxrRUFBa0U7UUFDbEUsb0VBQW9FO1FBQ3BFLHFCQUFxQjtRQUNyQixNQUFNLDJCQUEyQixHQUFHLGdCQUFnQixDQUFDLHFCQUFxQixFQUFFO2FBQzFFLE1BQU0sQ0FBRSxDQUFFLEtBQWtCLEVBQUUsSUFBZ0MsRUFBRyxFQUFFO1lBQ25FLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQyxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2pELENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBVSxDQUFFLENBQUM7UUFFeEIsSUFBSSxvQkFBb0IsR0FBRyxDQUFFLEdBQUcsaUJBQWlCLENBQUU7YUFDakQsTUFBTSxDQUFFLENBQUUsUUFBZ0IsRUFBRyxFQUFFLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLENBQUUsUUFBUSxDQUFFLENBQUUsQ0FBQztRQUVqRix5RUFBeUU7UUFDekUsNERBQTREO1FBQzVELDREQUE0RDtRQUM1RCxvQkFBb0IsR0FBRyxvQkFBb0I7YUFDekMsTUFBTSxDQUFFLENBQUUsUUFBZ0IsRUFBRyxFQUFFLENBQUMsUUFBUSxLQUFLLGFBQWEsQ0FBRSxDQUFDO1FBRS9ELDBDQUEwQztRQUMxQyxNQUFNLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBRSxZQUFZLENBQUMsRUFBRTtZQUNyRSxPQUFPO2dCQUNOLElBQUksRUFBRSxZQUFZO2dCQUNsQixJQUFJLEVBQUUsS0FBSztnQkFDWCxLQUFLLEVBQUUsZ0JBQUssQ0FBQyxNQUFNO2FBQ2EsQ0FBQztRQUNuQyxDQUFDLENBQUUsQ0FBQztRQUVKLGdCQUFNLENBQUMsT0FBTyxDQUFFLHFEQUFxRCxvQkFBb0IsQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLEdBQUcsQ0FBRSxDQUFDO1FBQzlHLGdCQUFnQixDQUFDLGdCQUFnQixDQUFFLENBQUMsRUFBRSxvQkFBb0IsQ0FBRSxDQUFDO0lBQzlELENBQUMsQ0FBRSxDQUFDO0lBRUosT0FBTyxZQUFZLENBQUM7QUFDckIsQ0FBQztBQW5ERCxvRUFtREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcm9qZWN0LCBDbGFzc0luc3RhbmNlUHJvcGVydHlUeXBlcywgUHJvcGVydHlEZWNsYXJhdGlvblN0cnVjdHVyZSwgU2NvcGUgfSBmcm9tIFwidHMtbW9ycGhcIjtcbmltcG9ydCB7IHBhcnNlSnNDbGFzc2VzIH0gZnJvbSBcIi4vcGFyc2UtanMtY2xhc3Nlc1wiO1xuaW1wb3J0IHsgY29ycmVjdEpzUHJvcGVydGllcyB9IGZyb20gXCIuL2NvcnJlY3QtanMtcHJvcGVydGllc1wiO1xuaW1wb3J0IGxvZ2dlciBmcm9tIFwiLi4vLi4vbG9nZ2VyL2xvZ2dlclwiO1xuXG4vKipcbiAqIFBhcnNlcyBhbGwgc291cmNlIGZpbGVzIGxvb2tpbmcgZm9yIEVTNiBjbGFzc2VzLCBhbmQgdGFrZXMgYW55IGB0aGlzYFxuICogcHJvcGVydHkgYWNjZXNzIHRvIGNyZWF0ZSBhIFByb3BlcnR5RGVjbGFyYXRpb24gZm9yIHRoZSBjbGFzcy5cbiAqXG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgICAgY2xhc3MgU29tZXRoaW5nIHtcbiAqICAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgICAgICAgICB0aGlzLnNvbWVQcm9wID0gMTtcbiAqICAgICAgICAgfVxuICogICAgIH1cbiAqXG4gKiBJcyBjaGFuZ2VkIHRvOlxuICpcbiAqICAgICBjbGFzcyBTb21ldGhpbmcge1xuICogICAgICAgICBzb21lUHJvcDogYW55O1xuICpcbiAqICAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgICAgICAgICB0aGlzLnNvbWVQcm9wID0gMTtcbiAqICAgICAgICAgfVxuICogICAgIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZENsYXNzUHJvcGVydHlEZWNsYXJhdGlvbnMoIHRzQXN0UHJvamVjdDogUHJvamVjdCApOiBQcm9qZWN0IHtcblx0Ly8gUGFyc2UgdGhlIEpTIGNsYXNzZXMgZm9yIGFsbCBvZiB0aGUgdGhpcy54eXogcHJvcGVydGllcyB0aGF0IHRoZXkgdXNlXG5cdGNvbnN0IGpzQ2xhc3NlcyA9IHBhcnNlSnNDbGFzc2VzKCB0c0FzdFByb2plY3QgKTtcblxuXHQvLyBDb3JyZWN0IHRoZSBKUyBjbGFzc2VzJyBwcm9wZXJ0aWVzIGZvciBzdXBlcmNsYXNzL3N1YmNsYXNzIHJlbGF0aW9uc2hpcHNcblx0Ly8gKGVzc2VudGlhbGx5IHJlbW92ZSBwcm9wZXJ0aWVzIGZyb20gc3ViY2xhc3NlcyB0aGF0IGFyZSBkZWZpbmVkIGJ5IHRoZWlyXG5cdC8vIHN1cGVyY2xhc3Nlcylcblx0Y29uc3QgcHJvcGVydGllc0NvcnJlY3RlZEpzQ2xhc3NlcyA9IGNvcnJlY3RKc1Byb3BlcnRpZXMoIGpzQ2xhc3NlcyApO1xuXG5cdC8vIEZpbGwgaW4gZmllbGQgZGVmaW5pdGlvbnMgZm9yIGVhY2ggb2YgdGhlIGNsYXNzZXNcblx0cHJvcGVydGllc0NvcnJlY3RlZEpzQ2xhc3Nlcy5mb3JFYWNoKCBqc0NsYXNzID0+IHtcblx0XHRjb25zdCBzb3VyY2VGaWxlID0gdHNBc3RQcm9qZWN0LmdldFNvdXJjZUZpbGVPclRocm93KCBqc0NsYXNzLnBhdGggKTtcblx0XHRsb2dnZXIudmVyYm9zZSggYCAgVXBkYXRpbmcgY2xhc3MgJyR7anNDbGFzcy5uYW1lfScgaW4gJyR7c291cmNlRmlsZS5nZXRGaWxlUGF0aCgpfSdgICk7XG5cblx0XHRjb25zdCBjbGFzc0RlY2xhcmF0aW9uID0gc291cmNlRmlsZS5nZXRDbGFzc09yVGhyb3coIGpzQ2xhc3MubmFtZSEgKTtcblx0XHRjb25zdCBqc0NsYXNzUHJvcGVydGllcyA9IGpzQ2xhc3MucHJvcGVydGllcztcblxuXHRcdC8vIElmIHRoZSB1dGlsaXR5IHdhcyBydW4gYWdhaW5zdCBhIFR5cGVTY3JpcHQgY29kZWJhc2UsIHdlIHNob3VsZCBub3Rcblx0XHQvLyBmaWxsIGluIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBmb3IgcHJvcGVydGllcyB0aGF0IGFyZSBhbHJlYWR5XG5cdFx0Ly8gZGVjbGFyZWQgaW4gdGhlIGNsYXNzLiBIb3dldmVyLCB3ZSAqc2hvdWxkKiBmaWxsIGluIGFueSBtaXNzaW5nXG5cdFx0Ly8gZGVjbGFyYXRpb25zLiBSZW1vdmluZyBhbnkgYWxyZWFkeS1kZWNsYXJlZCBkZWNsYXJhdGlvbnMgZnJvbSB0aGVcblx0XHQvLyBqc0NsYXNzUHJvcGVydGllcy5cblx0XHRjb25zdCBjdXJyZW50UHJvcGVydHlEZWNsYXJhdGlvbnMgPSBjbGFzc0RlY2xhcmF0aW9uLmdldEluc3RhbmNlUHJvcGVydGllcygpXG5cdFx0XHQucmVkdWNlKCAoIHByb3BzOiBTZXQ8c3RyaW5nPiwgcHJvcDogQ2xhc3NJbnN0YW5jZVByb3BlcnR5VHlwZXMgKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHByb3BOYW1lID0gcHJvcC5nZXROYW1lKCk7XG5cdFx0XHRcdHJldHVybiBwcm9wTmFtZSA/IHByb3BzLmFkZCggcHJvcE5hbWUgKSA6IHByb3BzO1xuXHRcdFx0fSwgbmV3IFNldDxzdHJpbmc+KCkgKTtcblxuXHRcdGxldCB1bmRlY2xhcmVkUHJvcGVydGllcyA9IFsgLi4uanNDbGFzc1Byb3BlcnRpZXMgXVxuXHRcdFx0LmZpbHRlciggKCBwcm9wTmFtZTogc3RyaW5nICkgPT4gIWN1cnJlbnRQcm9wZXJ0eURlY2xhcmF0aW9ucy5oYXMoIHByb3BOYW1lICkgKTtcblxuXHRcdC8vIElmIHRoZSB1dGlsaXR5IGZvdW5kIGEgcmVmZXJlbmNlIHRvIHRoaXMuY29uc3RydWN0b3IsIHdlIGRvbid0IHdhbnQgdG9cblx0XHQvLyBhZGQgYSBwcm9wZXJ0eSBjYWxsZWQgJ2NvbnN0cnVjdG9yJy4gRmlsdGVyIHRoYXQgb3V0IG5vdy5cblx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vZ3JlZ2phY29icy9qcy10by10cy1jb252ZXJ0ZXIvaXNzdWVzLzlcblx0XHR1bmRlY2xhcmVkUHJvcGVydGllcyA9IHVuZGVjbGFyZWRQcm9wZXJ0aWVzXG5cdFx0XHQuZmlsdGVyKCAoIHByb3BOYW1lOiBzdHJpbmcgKSA9PiBwcm9wTmFtZSAhPT0gJ2NvbnN0cnVjdG9yJyApO1xuXG5cdFx0Ly8gQWRkIGFsbCBjdXJyZW50bHktdW5kZWNsYXJlZCBwcm9wZXJ0aWVzXG5cdFx0Y29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbnMgPSB1bmRlY2xhcmVkUHJvcGVydGllcy5tYXAoIHByb3BlcnR5TmFtZSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRuYW1lOiBwcm9wZXJ0eU5hbWUsXG5cdFx0XHRcdHR5cGU6ICdhbnknLFxuXHRcdFx0XHRzY29wZTogU2NvcGUuUHVibGljXG5cdFx0XHR9IGFzIFByb3BlcnR5RGVjbGFyYXRpb25TdHJ1Y3R1cmU7XG5cdFx0fSApO1xuXG5cdFx0bG9nZ2VyLnZlcmJvc2UoIGAgICAgQWRkaW5nIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBmb3IgcHJvcGVydGllczogJyR7dW5kZWNsYXJlZFByb3BlcnRpZXMuam9pbiggXCInLCAnXCIgKX0nYCApO1xuXHRcdGNsYXNzRGVjbGFyYXRpb24uaW5zZXJ0UHJvcGVydGllcyggMCwgcHJvcGVydHlEZWNsYXJhdGlvbnMgKTtcblx0fSApO1xuXG5cdHJldHVybiB0c0FzdFByb2plY3Q7XG59Il19