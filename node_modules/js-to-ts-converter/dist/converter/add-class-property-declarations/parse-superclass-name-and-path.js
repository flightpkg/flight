"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSuperclassNameAndPath = void 0;
const is_valid_identifier_1 = require("../../util/is-valid-identifier");
const find_import_for_identifier_1 = require("../../util/find-import-for-identifier");
const resolve = require('resolve');
const TraceError = require('trace-error');
/**
 * Given a file and ClassDeclaration, finds the name of the superclass and the
 * full path to the module (file) that hosts the superclass.
 *
 * `superclass` and `superclassPath` in the return object will be `null` if
 * there is no superclass.
 */
function parseSuperclassNameAndPath(file, fileClass) {
    let superclassName;
    let superclassPath;
    const heritage = fileClass.getExtends();
    if (heritage) {
        superclassName = heritage.getExpression().getText();
        // Confirm that the superclass is an identifier rather than an
        // expression. It would be a bit much to try to understand expressions
        // as a class's 'extends', so just ignore these for now.
        // Example of ignored class extends:
        //
        //    class MyClass extends Mixin.mix( MixinClass1, MixinClass2 )
        //
        if (!(0, is_valid_identifier_1.isValidIdentifier)(superclassName)) {
            superclassName = undefined; // superclass was not a valid identifier
        }
        else if (!!file.getClass(superclassName)) {
            superclassPath = file.getFilePath();
        }
        else {
            superclassPath = findImportPathForIdentifier(file, superclassName);
        }
    }
    return {
        superclassName,
        superclassPath: superclassPath && superclassPath.replace(/\\/g, '/') // normalize backslashes on Windows to forward slashes so we can compare directories with the paths that ts-morph produces
    };
}
exports.parseSuperclassNameAndPath = parseSuperclassNameAndPath;
/**
 * Finds the absolute path for the import with the given `identifier`.
 *
 * For example, if we were looking for the identifier 'MyClass' in the following
 * list of imports:
 *
 *     import { Something } from './somewhere';
 *     import { MyClass } from './my-class';
 *
 * Then the method would return '/absolute/path/to/my-class.js';
 *
 * If there is no import for `identifier`, the method returns `undefined`.
 */
function findImportPathForIdentifier(sourceFile, identifier) {
    const importWithIdentifier = (0, find_import_for_identifier_1.findImportForIdentifier)(sourceFile, identifier);
    if (importWithIdentifier) {
        const moduleSpecifier = importWithIdentifier.getModuleSpecifier().getLiteralValue();
        if (!moduleSpecifier.startsWith('.')) {
            // if the import path isn't relative (i.e. doesn't start with './'
            // or '../'), then it must be in node_modules. Return `undefined` to
            // represent that. We don't want to parse node_modules, and we
            // should be able to migrate the codebase without node_modules even
            // being installed.
            return undefined;
        }
        // If it's a relative import, return the absolute path to the module,
        // based on the source file that the import was found
        const basedir = sourceFile.getDirectoryPath();
        try {
            return resolve.sync(moduleSpecifier, {
                basedir,
                extensions: ['.ts', '.js']
            });
        }
        catch (error) {
            throw new TraceError(`
				An error occurred while trying to resolve the absolute path to
				the import of identifier '${identifier}' in source file:
				    '${sourceFile.getFilePath()}'
				    
				Was looking at the import with text:
				    ${importWithIdentifier.getText()}   
			`.trim().replace(/^\t*/gm, ''), error);
        }
    }
    // Nothing found, return undefined
    return undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2Utc3VwZXJjbGFzcy1uYW1lLWFuZC1wYXRoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnZlcnRlci9hZGQtY2xhc3MtcHJvcGVydHktZGVjbGFyYXRpb25zL3BhcnNlLXN1cGVyY2xhc3MtbmFtZS1hbmQtcGF0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3RUFBbUU7QUFFbkUsc0ZBQWdGO0FBQ2hGLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBRSxTQUFTLENBQUUsQ0FBQztBQUNyQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUUsYUFBYSxDQUFFLENBQUM7QUFFNUM7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsMEJBQTBCLENBQ3pDLElBQWdCLEVBQ2hCLFNBQTJCO0lBSzNCLElBQUksY0FBa0MsQ0FBQztJQUN2QyxJQUFJLGNBQWtDLENBQUM7SUFFdkMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3hDLElBQUksUUFBUSxFQUFHO1FBQ2QsY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVwRCw4REFBOEQ7UUFDOUQsc0VBQXNFO1FBQ3RFLHdEQUF3RDtRQUN4RCxvQ0FBb0M7UUFDcEMsRUFBRTtRQUNGLGlFQUFpRTtRQUNqRSxFQUFFO1FBQ0YsSUFBSSxDQUFDLElBQUEsdUNBQWlCLEVBQUUsY0FBYyxDQUFFLEVBQUc7WUFDMUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxDQUFFLHdDQUF3QztTQUVyRTthQUFNLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUUsY0FBYyxDQUFFLEVBQUc7WUFDOUMsY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUVwQzthQUFNO1lBQ04sY0FBYyxHQUFHLDJCQUEyQixDQUFFLElBQUksRUFBRSxjQUFjLENBQUUsQ0FBQztTQUNyRTtLQUNEO0lBRUQsT0FBTztRQUNOLGNBQWM7UUFDZCxjQUFjLEVBQUUsY0FBYyxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBRSxDQUFFLDBIQUEwSDtLQUNsTSxDQUFDO0FBQ0gsQ0FBQztBQXBDRCxnRUFvQ0M7QUFHRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxTQUFTLDJCQUEyQixDQUNuQyxVQUFzQixFQUN0QixVQUFrQjtJQUVsQixNQUFNLG9CQUFvQixHQUFHLElBQUEsb0RBQXVCLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBRSxDQUFDO0lBRS9FLElBQUksb0JBQW9CLEVBQUc7UUFDMUIsTUFBTSxlQUFlLEdBQUcsb0JBQW9CLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUVwRixJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBRSxHQUFHLENBQUUsRUFBRztZQUN4QyxrRUFBa0U7WUFDbEUsb0VBQW9FO1lBQ3BFLDhEQUE4RDtZQUM5RCxtRUFBbUU7WUFDbkUsbUJBQW1CO1lBQ25CLE9BQU8sU0FBUyxDQUFDO1NBQ2pCO1FBRUQscUVBQXFFO1FBQ3JFLHFEQUFxRDtRQUNyRCxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUM5QyxJQUFJO1lBQ0gsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFFLGVBQWUsRUFBRTtnQkFDckMsT0FBTztnQkFDUCxVQUFVLEVBQUUsQ0FBRSxLQUFLLEVBQUUsS0FBSyxDQUFFO2FBQzVCLENBQUUsQ0FBQztTQUVKO1FBQUMsT0FBTyxLQUFLLEVBQUc7WUFDaEIsTUFBTSxJQUFJLFVBQVUsQ0FBRTs7Z0NBRU8sVUFBVTtXQUMvQixVQUFVLENBQUMsV0FBVyxFQUFFOzs7VUFHekIsb0JBQW9CLENBQUMsT0FBTyxFQUFFO0lBQ3BDLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFFLFFBQVEsRUFBRSxFQUFFLENBQUUsRUFBRSxLQUFLLENBQUUsQ0FBQztTQUMxQztLQUNEO0lBRUQsa0NBQWtDO0lBQ2xDLE9BQU8sU0FBUyxDQUFDO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1ZhbGlkSWRlbnRpZmllciB9IGZyb20gXCIuLi8uLi91dGlsL2lzLXZhbGlkLWlkZW50aWZpZXJcIjtcbmltcG9ydCB7IENsYXNzRGVjbGFyYXRpb24sIFNvdXJjZUZpbGUgfSBmcm9tIFwidHMtbW9ycGhcIjtcbmltcG9ydCB7IGZpbmRJbXBvcnRGb3JJZGVudGlmaWVyIH0gZnJvbSBcIi4uLy4uL3V0aWwvZmluZC1pbXBvcnQtZm9yLWlkZW50aWZpZXJcIjtcbmNvbnN0IHJlc29sdmUgPSByZXF1aXJlKCAncmVzb2x2ZScgKTtcbmNvbnN0IFRyYWNlRXJyb3IgPSByZXF1aXJlKCAndHJhY2UtZXJyb3InICk7XG5cbi8qKlxuICogR2l2ZW4gYSBmaWxlIGFuZCBDbGFzc0RlY2xhcmF0aW9uLCBmaW5kcyB0aGUgbmFtZSBvZiB0aGUgc3VwZXJjbGFzcyBhbmQgdGhlXG4gKiBmdWxsIHBhdGggdG8gdGhlIG1vZHVsZSAoZmlsZSkgdGhhdCBob3N0cyB0aGUgc3VwZXJjbGFzcy5cbiAqXG4gKiBgc3VwZXJjbGFzc2AgYW5kIGBzdXBlcmNsYXNzUGF0aGAgaW4gdGhlIHJldHVybiBvYmplY3Qgd2lsbCBiZSBgbnVsbGAgaWZcbiAqIHRoZXJlIGlzIG5vIHN1cGVyY2xhc3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN1cGVyY2xhc3NOYW1lQW5kUGF0aChcblx0ZmlsZTogU291cmNlRmlsZSxcblx0ZmlsZUNsYXNzOiBDbGFzc0RlY2xhcmF0aW9uXG4pOiB7XG5cdHN1cGVyY2xhc3NOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdHN1cGVyY2xhc3NQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG59IHtcblx0bGV0IHN1cGVyY2xhc3NOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdGxldCBzdXBlcmNsYXNzUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdGNvbnN0IGhlcml0YWdlID0gZmlsZUNsYXNzLmdldEV4dGVuZHMoKTtcblx0aWYoIGhlcml0YWdlICkge1xuXHRcdHN1cGVyY2xhc3NOYW1lID0gaGVyaXRhZ2UuZ2V0RXhwcmVzc2lvbigpLmdldFRleHQoKTtcblxuXHRcdC8vIENvbmZpcm0gdGhhdCB0aGUgc3VwZXJjbGFzcyBpcyBhbiBpZGVudGlmaWVyIHJhdGhlciB0aGFuIGFuXG5cdFx0Ly8gZXhwcmVzc2lvbi4gSXQgd291bGQgYmUgYSBiaXQgbXVjaCB0byB0cnkgdG8gdW5kZXJzdGFuZCBleHByZXNzaW9uc1xuXHRcdC8vIGFzIGEgY2xhc3MncyAnZXh0ZW5kcycsIHNvIGp1c3QgaWdub3JlIHRoZXNlIGZvciBub3cuXG5cdFx0Ly8gRXhhbXBsZSBvZiBpZ25vcmVkIGNsYXNzIGV4dGVuZHM6XG5cdFx0Ly9cblx0XHQvLyAgICBjbGFzcyBNeUNsYXNzIGV4dGVuZHMgTWl4aW4ubWl4KCBNaXhpbkNsYXNzMSwgTWl4aW5DbGFzczIgKVxuXHRcdC8vXG5cdFx0aWYoICFpc1ZhbGlkSWRlbnRpZmllciggc3VwZXJjbGFzc05hbWUgKSApIHtcblx0XHRcdHN1cGVyY2xhc3NOYW1lID0gdW5kZWZpbmVkOyAgLy8gc3VwZXJjbGFzcyB3YXMgbm90IGEgdmFsaWQgaWRlbnRpZmllclxuXG5cdFx0fSBlbHNlIGlmKCAhIWZpbGUuZ2V0Q2xhc3MoIHN1cGVyY2xhc3NOYW1lICkgKSB7XG5cdFx0XHRzdXBlcmNsYXNzUGF0aCA9IGZpbGUuZ2V0RmlsZVBhdGgoKTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdXBlcmNsYXNzUGF0aCA9IGZpbmRJbXBvcnRQYXRoRm9ySWRlbnRpZmllciggZmlsZSwgc3VwZXJjbGFzc05hbWUgKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHN1cGVyY2xhc3NOYW1lLFxuXHRcdHN1cGVyY2xhc3NQYXRoOiBzdXBlcmNsYXNzUGF0aCAmJiBzdXBlcmNsYXNzUGF0aC5yZXBsYWNlKCAvXFxcXC9nLCAnLycgKSAgLy8gbm9ybWFsaXplIGJhY2tzbGFzaGVzIG9uIFdpbmRvd3MgdG8gZm9yd2FyZCBzbGFzaGVzIHNvIHdlIGNhbiBjb21wYXJlIGRpcmVjdG9yaWVzIHdpdGggdGhlIHBhdGhzIHRoYXQgdHMtbW9ycGggcHJvZHVjZXNcblx0fTtcbn1cblxuXG4vKipcbiAqIEZpbmRzIHRoZSBhYnNvbHV0ZSBwYXRoIGZvciB0aGUgaW1wb3J0IHdpdGggdGhlIGdpdmVuIGBpZGVudGlmaWVyYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgaWYgd2Ugd2VyZSBsb29raW5nIGZvciB0aGUgaWRlbnRpZmllciAnTXlDbGFzcycgaW4gdGhlIGZvbGxvd2luZ1xuICogbGlzdCBvZiBpbXBvcnRzOlxuICpcbiAqICAgICBpbXBvcnQgeyBTb21ldGhpbmcgfSBmcm9tICcuL3NvbWV3aGVyZSc7XG4gKiAgICAgaW1wb3J0IHsgTXlDbGFzcyB9IGZyb20gJy4vbXktY2xhc3MnO1xuICpcbiAqIFRoZW4gdGhlIG1ldGhvZCB3b3VsZCByZXR1cm4gJy9hYnNvbHV0ZS9wYXRoL3RvL215LWNsYXNzLmpzJztcbiAqXG4gKiBJZiB0aGVyZSBpcyBubyBpbXBvcnQgZm9yIGBpZGVudGlmaWVyYCwgdGhlIG1ldGhvZCByZXR1cm5zIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiBmaW5kSW1wb3J0UGF0aEZvcklkZW50aWZpZXIoXG5cdHNvdXJjZUZpbGU6IFNvdXJjZUZpbGUsXG5cdGlkZW50aWZpZXI6IHN0cmluZ1xuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgaW1wb3J0V2l0aElkZW50aWZpZXIgPSBmaW5kSW1wb3J0Rm9ySWRlbnRpZmllciggc291cmNlRmlsZSwgaWRlbnRpZmllciApO1xuXG5cdGlmKCBpbXBvcnRXaXRoSWRlbnRpZmllciApIHtcblx0XHRjb25zdCBtb2R1bGVTcGVjaWZpZXIgPSBpbXBvcnRXaXRoSWRlbnRpZmllci5nZXRNb2R1bGVTcGVjaWZpZXIoKS5nZXRMaXRlcmFsVmFsdWUoKTtcblxuXHRcdGlmKCAhbW9kdWxlU3BlY2lmaWVyLnN0YXJ0c1dpdGgoICcuJyApICkge1xuXHRcdFx0Ly8gaWYgdGhlIGltcG9ydCBwYXRoIGlzbid0IHJlbGF0aXZlIChpLmUuIGRvZXNuJ3Qgc3RhcnQgd2l0aCAnLi8nXG5cdFx0XHQvLyBvciAnLi4vJyksIHRoZW4gaXQgbXVzdCBiZSBpbiBub2RlX21vZHVsZXMuIFJldHVybiBgdW5kZWZpbmVkYCB0b1xuXHRcdFx0Ly8gcmVwcmVzZW50IHRoYXQuIFdlIGRvbid0IHdhbnQgdG8gcGFyc2Ugbm9kZV9tb2R1bGVzLCBhbmQgd2Vcblx0XHRcdC8vIHNob3VsZCBiZSBhYmxlIHRvIG1pZ3JhdGUgdGhlIGNvZGViYXNlIHdpdGhvdXQgbm9kZV9tb2R1bGVzIGV2ZW5cblx0XHRcdC8vIGJlaW5nIGluc3RhbGxlZC5cblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgaXQncyBhIHJlbGF0aXZlIGltcG9ydCwgcmV0dXJuIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBtb2R1bGUsXG5cdFx0Ly8gYmFzZWQgb24gdGhlIHNvdXJjZSBmaWxlIHRoYXQgdGhlIGltcG9ydCB3YXMgZm91bmRcblx0XHRjb25zdCBiYXNlZGlyID0gc291cmNlRmlsZS5nZXREaXJlY3RvcnlQYXRoKCk7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiByZXNvbHZlLnN5bmMoIG1vZHVsZVNwZWNpZmllciwge1xuXHRcdFx0XHRiYXNlZGlyLFxuXHRcdFx0XHRleHRlbnNpb25zOiBbICcudHMnLCAnLmpzJyBdXG5cdFx0XHR9ICk7XG5cblx0XHR9IGNhdGNoKCBlcnJvciApIHtcblx0XHRcdHRocm93IG5ldyBUcmFjZUVycm9yKCBgXG5cdFx0XHRcdEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHRyeWluZyB0byByZXNvbHZlIHRoZSBhYnNvbHV0ZSBwYXRoIHRvXG5cdFx0XHRcdHRoZSBpbXBvcnQgb2YgaWRlbnRpZmllciAnJHtpZGVudGlmaWVyfScgaW4gc291cmNlIGZpbGU6XG5cdFx0XHRcdCAgICAnJHtzb3VyY2VGaWxlLmdldEZpbGVQYXRoKCl9J1xuXHRcdFx0XHQgICAgXG5cdFx0XHRcdFdhcyBsb29raW5nIGF0IHRoZSBpbXBvcnQgd2l0aCB0ZXh0OlxuXHRcdFx0XHQgICAgJHtpbXBvcnRXaXRoSWRlbnRpZmllci5nZXRUZXh0KCl9ICAgXG5cdFx0XHRgLnRyaW0oKS5yZXBsYWNlKCAvXlxcdCovZ20sICcnICksIGVycm9yICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gTm90aGluZyBmb3VuZCwgcmV0dXJuIHVuZGVmaW5lZFxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufSJdfQ==