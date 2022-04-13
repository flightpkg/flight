"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_valid_identifier_1 = require("./is-valid-identifier");
const find_import_for_identifier_1 = require("./find-import-for-identifier");
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
        if (!is_valid_identifier_1.isValidIdentifier(superclassName)) {
            superclassName = undefined; // superclass was not a valid identifier
        }
        else {
            superclassPath = findImportPathForIdentifier(file, superclassName) || file.getFilePath();
        }
    }
    return { superclassName, superclassPath };
}
exports.parseSuperclassNameAndPath = parseSuperclassNameAndPath;
/**
 * Finds the import path for the given `identifier`.
 *
 * For example, if we were looking for the identifier 'MyClass' in the following
 * list of imports:
 *
 *     import { Something } from './somewhere';
 *     import { MyClass } from './my-class';
 *
 * Then the method would return 'absolute/path/to/my-class.js';
 *
 * If there is no import for `identifier`, the method returns `null`.
 */
function findImportPathForIdentifier(sourceFile, identifier) {
    const importWithIdentifier = find_import_for_identifier_1.findImportForIdentifier(sourceFile, identifier);
    if (importWithIdentifier) {
        const moduleSpecifier = importWithIdentifier.getModuleSpecifier().getLiteralValue();
        const basedir = sourceFile.getDirectoryPath();
        // Return absolute path to the module, based on the source file that the
        // import was found
        try {
            return resolve.sync(moduleSpecifier, { basedir })
                .replace(/\\/g, '/'); // normalize backslashes on Windows to forward slashes so we can compare directories with the paths that ts-simple-ast produces
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
    // Nothing found, return null
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2Utc3VwZXJjbGFzcy1uYW1lLWFuZC1wYXRoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvcGFyc2Utc3VwZXJjbGFzcy1uYW1lLWFuZC1wYXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0RBQTBEO0FBRTFELDZFQUF1RTtBQUN2RSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUUsU0FBUyxDQUFFLENBQUM7QUFDckMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFFLGFBQWEsQ0FBRSxDQUFDO0FBRTVDOzs7Ozs7R0FNRztBQUNILG9DQUNDLElBQWdCLEVBQ2hCLFNBQTJCO0lBSzNCLElBQUksY0FBa0MsQ0FBQztJQUN2QyxJQUFJLGNBQWtDLENBQUM7SUFFdkMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3hDLElBQUksUUFBUSxFQUFHO1FBQ2QsY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVwRCw4REFBOEQ7UUFDOUQsc0VBQXNFO1FBQ3RFLHdEQUF3RDtRQUN4RCxvQ0FBb0M7UUFDcEMsRUFBRTtRQUNGLGlFQUFpRTtRQUNqRSxFQUFFO1FBQ0YsSUFBSSxDQUFDLHVDQUFpQixDQUFFLGNBQWMsQ0FBRSxFQUFHO1lBQzFDLGNBQWMsR0FBRyxTQUFTLENBQUMsQ0FBRSx3Q0FBd0M7U0FDckU7YUFBTTtZQUNOLGNBQWMsR0FBRywyQkFBMkIsQ0FBRSxJQUFJLEVBQUUsY0FBYyxDQUFFLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQzNGO0tBQ0Q7SUFFRCxPQUFPLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxDQUFDO0FBQzNDLENBQUM7QUE3QkQsZ0VBNkJDO0FBR0Q7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gscUNBQ0MsVUFBc0IsRUFDdEIsVUFBa0I7SUFFbEIsTUFBTSxvQkFBb0IsR0FBRyxvREFBdUIsQ0FBRSxVQUFVLEVBQUUsVUFBVSxDQUFFLENBQUM7SUFFL0UsSUFBSSxvQkFBb0IsRUFBRztRQUMxQixNQUFNLGVBQWUsR0FBRyxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3BGLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRTlDLHdFQUF3RTtRQUN4RSxtQkFBbUI7UUFDbkIsSUFBSTtZQUNILE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBRSxlQUFlLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBRTtpQkFDakQsT0FBTyxDQUFFLEtBQUssRUFBRSxHQUFHLENBQUUsQ0FBQyxDQUFFLCtIQUErSDtTQUV6SjtRQUFDLE9BQU8sS0FBSyxFQUFHO1lBQ2hCLE1BQU0sSUFBSSxVQUFVLENBQUU7O2dDQUVPLFVBQVU7V0FDL0IsVUFBVSxDQUFDLFdBQVcsRUFBRTs7O1VBR3pCLG9CQUFvQixDQUFDLE9BQU8sRUFBRTtJQUNwQyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBRSxRQUFRLEVBQUUsRUFBRSxDQUFFLEVBQUUsS0FBSyxDQUFFLENBQUM7U0FDMUM7S0FDRDtJQUVELDZCQUE2QjtJQUM3QixPQUFPLElBQUksQ0FBQztBQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1ZhbGlkSWRlbnRpZmllciB9IGZyb20gXCIuL2lzLXZhbGlkLWlkZW50aWZpZXJcIjtcbmltcG9ydCB7IENsYXNzRGVjbGFyYXRpb24sIFNvdXJjZUZpbGUgfSBmcm9tIFwidHMtc2ltcGxlLWFzdFwiO1xuaW1wb3J0IHsgZmluZEltcG9ydEZvcklkZW50aWZpZXIgfSBmcm9tIFwiLi9maW5kLWltcG9ydC1mb3ItaWRlbnRpZmllclwiO1xuY29uc3QgcmVzb2x2ZSA9IHJlcXVpcmUoICdyZXNvbHZlJyApO1xuY29uc3QgVHJhY2VFcnJvciA9IHJlcXVpcmUoICd0cmFjZS1lcnJvcicgKTtcblxuLyoqXG4gKiBHaXZlbiBhIGZpbGUgYW5kIENsYXNzRGVjbGFyYXRpb24sIGZpbmRzIHRoZSBuYW1lIG9mIHRoZSBzdXBlcmNsYXNzIGFuZCB0aGVcbiAqIGZ1bGwgcGF0aCB0byB0aGUgbW9kdWxlIChmaWxlKSB0aGF0IGhvc3RzIHRoZSBzdXBlcmNsYXNzLlxuICpcbiAqIGBzdXBlcmNsYXNzYCBhbmQgYHN1cGVyY2xhc3NQYXRoYCBpbiB0aGUgcmV0dXJuIG9iamVjdCB3aWxsIGJlIGBudWxsYCBpZlxuICogdGhlcmUgaXMgbm8gc3VwZXJjbGFzcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU3VwZXJjbGFzc05hbWVBbmRQYXRoKFxuXHRmaWxlOiBTb3VyY2VGaWxlLFxuXHRmaWxlQ2xhc3M6IENsYXNzRGVjbGFyYXRpb25cbik6IHtcblx0c3VwZXJjbGFzc05hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0c3VwZXJjbGFzc1BhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcbn0ge1xuXHRsZXQgc3VwZXJjbGFzc05hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0bGV0IHN1cGVyY2xhc3NQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0Y29uc3QgaGVyaXRhZ2UgPSBmaWxlQ2xhc3MuZ2V0RXh0ZW5kcygpO1xuXHRpZiggaGVyaXRhZ2UgKSB7XG5cdFx0c3VwZXJjbGFzc05hbWUgPSBoZXJpdGFnZS5nZXRFeHByZXNzaW9uKCkuZ2V0VGV4dCgpO1xuXG5cdFx0Ly8gQ29uZmlybSB0aGF0IHRoZSBzdXBlcmNsYXNzIGlzIGFuIGlkZW50aWZpZXIgcmF0aGVyIHRoYW4gYW5cblx0XHQvLyBleHByZXNzaW9uLiBJdCB3b3VsZCBiZSBhIGJpdCBtdWNoIHRvIHRyeSB0byB1bmRlcnN0YW5kIGV4cHJlc3Npb25zXG5cdFx0Ly8gYXMgYSBjbGFzcydzICdleHRlbmRzJywgc28ganVzdCBpZ25vcmUgdGhlc2UgZm9yIG5vdy5cblx0XHQvLyBFeGFtcGxlIG9mIGlnbm9yZWQgY2xhc3MgZXh0ZW5kczpcblx0XHQvL1xuXHRcdC8vICAgIGNsYXNzIE15Q2xhc3MgZXh0ZW5kcyBNaXhpbi5taXgoIE1peGluQ2xhc3MxLCBNaXhpbkNsYXNzMiApXG5cdFx0Ly9cblx0XHRpZiggIWlzVmFsaWRJZGVudGlmaWVyKCBzdXBlcmNsYXNzTmFtZSApICkge1xuXHRcdFx0c3VwZXJjbGFzc05hbWUgPSB1bmRlZmluZWQ7ICAvLyBzdXBlcmNsYXNzIHdhcyBub3QgYSB2YWxpZCBpZGVudGlmaWVyXG5cdFx0fSBlbHNlIHtcblx0XHRcdHN1cGVyY2xhc3NQYXRoID0gZmluZEltcG9ydFBhdGhGb3JJZGVudGlmaWVyKCBmaWxlLCBzdXBlcmNsYXNzTmFtZSApIHx8IGZpbGUuZ2V0RmlsZVBhdGgoKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4geyBzdXBlcmNsYXNzTmFtZSwgc3VwZXJjbGFzc1BhdGggfTtcbn1cblxuXG4vKipcbiAqIEZpbmRzIHRoZSBpbXBvcnQgcGF0aCBmb3IgdGhlIGdpdmVuIGBpZGVudGlmaWVyYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgaWYgd2Ugd2VyZSBsb29raW5nIGZvciB0aGUgaWRlbnRpZmllciAnTXlDbGFzcycgaW4gdGhlIGZvbGxvd2luZ1xuICogbGlzdCBvZiBpbXBvcnRzOlxuICpcbiAqICAgICBpbXBvcnQgeyBTb21ldGhpbmcgfSBmcm9tICcuL3NvbWV3aGVyZSc7XG4gKiAgICAgaW1wb3J0IHsgTXlDbGFzcyB9IGZyb20gJy4vbXktY2xhc3MnO1xuICpcbiAqIFRoZW4gdGhlIG1ldGhvZCB3b3VsZCByZXR1cm4gJ2Fic29sdXRlL3BhdGgvdG8vbXktY2xhc3MuanMnO1xuICpcbiAqIElmIHRoZXJlIGlzIG5vIGltcG9ydCBmb3IgYGlkZW50aWZpZXJgLCB0aGUgbWV0aG9kIHJldHVybnMgYG51bGxgLlxuICovXG5mdW5jdGlvbiBmaW5kSW1wb3J0UGF0aEZvcklkZW50aWZpZXIoXG5cdHNvdXJjZUZpbGU6IFNvdXJjZUZpbGUsXG5cdGlkZW50aWZpZXI6IHN0cmluZ1xuKTogc3RyaW5nIHwgbnVsbCB7XG5cdGNvbnN0IGltcG9ydFdpdGhJZGVudGlmaWVyID0gZmluZEltcG9ydEZvcklkZW50aWZpZXIoIHNvdXJjZUZpbGUsIGlkZW50aWZpZXIgKTtcblxuXHRpZiggaW1wb3J0V2l0aElkZW50aWZpZXIgKSB7XG5cdFx0Y29uc3QgbW9kdWxlU3BlY2lmaWVyID0gaW1wb3J0V2l0aElkZW50aWZpZXIuZ2V0TW9kdWxlU3BlY2lmaWVyKCkuZ2V0TGl0ZXJhbFZhbHVlKCk7XG5cdFx0Y29uc3QgYmFzZWRpciA9IHNvdXJjZUZpbGUuZ2V0RGlyZWN0b3J5UGF0aCgpO1xuXG5cdFx0Ly8gUmV0dXJuIGFic29sdXRlIHBhdGggdG8gdGhlIG1vZHVsZSwgYmFzZWQgb24gdGhlIHNvdXJjZSBmaWxlIHRoYXQgdGhlXG5cdFx0Ly8gaW1wb3J0IHdhcyBmb3VuZFxuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gcmVzb2x2ZS5zeW5jKCBtb2R1bGVTcGVjaWZpZXIsIHsgYmFzZWRpciB9IClcblx0XHRcdFx0LnJlcGxhY2UoIC9cXFxcL2csICcvJyApOyAgLy8gbm9ybWFsaXplIGJhY2tzbGFzaGVzIG9uIFdpbmRvd3MgdG8gZm9yd2FyZCBzbGFzaGVzIHNvIHdlIGNhbiBjb21wYXJlIGRpcmVjdG9yaWVzIHdpdGggdGhlIHBhdGhzIHRoYXQgdHMtc2ltcGxlLWFzdCBwcm9kdWNlc1xuXG5cdFx0fSBjYXRjaCggZXJyb3IgKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHJhY2VFcnJvciggYFxuXHRcdFx0XHRBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSB0cnlpbmcgdG8gcmVzb2x2ZSB0aGUgYWJzb2x1dGUgcGF0aCB0b1xuXHRcdFx0XHR0aGUgaW1wb3J0IG9mIGlkZW50aWZpZXIgJyR7aWRlbnRpZmllcn0nIGluIHNvdXJjZSBmaWxlOlxuXHRcdFx0XHQgICAgJyR7c291cmNlRmlsZS5nZXRGaWxlUGF0aCgpfSdcblx0XHRcdFx0ICAgIFxuXHRcdFx0XHRXYXMgbG9va2luZyBhdCB0aGUgaW1wb3J0IHdpdGggdGV4dDpcblx0XHRcdFx0ICAgICR7aW1wb3J0V2l0aElkZW50aWZpZXIuZ2V0VGV4dCgpfSAgIFxuXHRcdFx0YC50cmltKCkucmVwbGFjZSggL15cXHQqL2dtLCAnJyApLCBlcnJvciApO1xuXHRcdH1cblx0fVxuXG5cdC8vIE5vdGhpbmcgZm91bmQsIHJldHVybiBudWxsXG5cdHJldHVybiBudWxsO1xufVxuXG5cbiJdfQ==