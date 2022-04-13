"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findImportForIdentifier = void 0;
/**
 * Finds an ImportDeclaration for a given identifier (name).
 *
 * For instance, given this source file:
 *
 *     import { SomeClass1, SomeClass2 } from './somewhere';
 *     import { SomeClass3 } from './somewhere-else';
 *
 *     // ...
 *
 * And a call such as:
 *
 *     findImportForIdentifier( sourceFile, 'SomeClass3' );
 *
 * Then the second ImportDeclaration will be returned.
 */
function findImportForIdentifier(sourceFile, identifier) {
    return sourceFile
        .getImportDeclarations()
        .find((importDeclaration) => {
        const hasNamedImport = importDeclaration.getNamedImports()
            .map((namedImport) => namedImport.getName())
            .includes(identifier);
        const defaultImport = importDeclaration.getDefaultImport();
        const hasDefaultImport = !!defaultImport && defaultImport.getText() === identifier;
        return hasNamedImport || hasDefaultImport;
    });
}
exports.findImportForIdentifier = findImportForIdentifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1pbXBvcnQtZm9yLWlkZW50aWZpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbC9maW5kLWltcG9ydC1mb3ItaWRlbnRpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFDSCxTQUFnQix1QkFBdUIsQ0FDdEMsVUFBc0IsRUFDdEIsVUFBa0I7SUFFbEIsT0FBTyxVQUFVO1NBQ2YscUJBQXFCLEVBQUU7U0FDdkIsSUFBSSxDQUFFLENBQUUsaUJBQW9DLEVBQUcsRUFBRTtRQUNqRCxNQUFNLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUU7YUFDeEQsR0FBRyxDQUFFLENBQUUsV0FBNEIsRUFBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFFO2FBQ2hFLFFBQVEsQ0FBRSxVQUFVLENBQUUsQ0FBQztRQUV6QixNQUFNLGFBQWEsR0FBRyxpQkFBaUIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzNELE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLEtBQUssVUFBVSxDQUFDO1FBRW5GLE9BQU8sY0FBYyxJQUFJLGdCQUFnQixDQUFDO0lBQzNDLENBQUMsQ0FBRSxDQUFDO0FBQ04sQ0FBQztBQWhCRCwwREFnQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbXBvcnREZWNsYXJhdGlvbiwgSW1wb3J0U3BlY2lmaWVyLCBTb3VyY2VGaWxlIH0gZnJvbSBcInRzLW1vcnBoXCI7XG5cbi8qKlxuICogRmluZHMgYW4gSW1wb3J0RGVjbGFyYXRpb24gZm9yIGEgZ2l2ZW4gaWRlbnRpZmllciAobmFtZSkuXG4gKlxuICogRm9yIGluc3RhbmNlLCBnaXZlbiB0aGlzIHNvdXJjZSBmaWxlOlxuICpcbiAqICAgICBpbXBvcnQgeyBTb21lQ2xhc3MxLCBTb21lQ2xhc3MyIH0gZnJvbSAnLi9zb21ld2hlcmUnO1xuICogICAgIGltcG9ydCB7IFNvbWVDbGFzczMgfSBmcm9tICcuL3NvbWV3aGVyZS1lbHNlJztcbiAqXG4gKiAgICAgLy8gLi4uXG4gKlxuICogQW5kIGEgY2FsbCBzdWNoIGFzOlxuICpcbiAqICAgICBmaW5kSW1wb3J0Rm9ySWRlbnRpZmllciggc291cmNlRmlsZSwgJ1NvbWVDbGFzczMnICk7XG4gKlxuICogVGhlbiB0aGUgc2Vjb25kIEltcG9ydERlY2xhcmF0aW9uIHdpbGwgYmUgcmV0dXJuZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kSW1wb3J0Rm9ySWRlbnRpZmllcihcblx0c291cmNlRmlsZTogU291cmNlRmlsZSxcblx0aWRlbnRpZmllcjogc3RyaW5nXG4pOiBJbXBvcnREZWNsYXJhdGlvbiB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBzb3VyY2VGaWxlXG5cdFx0LmdldEltcG9ydERlY2xhcmF0aW9ucygpXG5cdFx0LmZpbmQoICggaW1wb3J0RGVjbGFyYXRpb246IEltcG9ydERlY2xhcmF0aW9uICkgPT4ge1xuXHRcdFx0Y29uc3QgaGFzTmFtZWRJbXBvcnQgPSBpbXBvcnREZWNsYXJhdGlvbi5nZXROYW1lZEltcG9ydHMoKVxuXHRcdFx0XHQubWFwKCAoIG5hbWVkSW1wb3J0OiBJbXBvcnRTcGVjaWZpZXIgKSA9PiBuYW1lZEltcG9ydC5nZXROYW1lKCkgKVxuXHRcdFx0XHQuaW5jbHVkZXMoIGlkZW50aWZpZXIgKTtcblxuXHRcdFx0Y29uc3QgZGVmYXVsdEltcG9ydCA9IGltcG9ydERlY2xhcmF0aW9uLmdldERlZmF1bHRJbXBvcnQoKTtcblx0XHRcdGNvbnN0IGhhc0RlZmF1bHRJbXBvcnQgPSAhIWRlZmF1bHRJbXBvcnQgJiYgZGVmYXVsdEltcG9ydC5nZXRUZXh0KCkgPT09IGlkZW50aWZpZXI7XG5cblx0XHRcdHJldHVybiBoYXNOYW1lZEltcG9ydCB8fCBoYXNEZWZhdWx0SW1wb3J0O1xuXHRcdH0gKTtcbn0iXX0=