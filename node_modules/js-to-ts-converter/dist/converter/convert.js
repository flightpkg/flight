"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = void 0;
const ts_morph_1 = require("ts-morph");
const add_class_property_declarations_1 = require("./add-class-property-declarations/add-class-property-declarations");
const add_optionals_to_function_params_1 = require("./add-optionals-to-function-params");
const filter_out_node_modules_1 = require("./filter-out-node-modules");
const logger_1 = __importDefault(require("../logger/logger"));
/**
 * Converts the source .js code to .ts
 */
function convert(tsAstProject) {
    if (tsAstProject.getSourceFiles().length === 0) {
        logger_1.default.info('Found no source files to process. Exiting.');
        return tsAstProject;
    }
    // Print input files
    logger_1.default.info('Processing the following source files:');
    printSourceFilesList(tsAstProject, '  ');
    logger_1.default.info(`
		Converting source files... This may take anywhere from a few minutes to 
		tens of minutes or longer depending on how many files are being 
		converted.
	`.replace(/\t*/gm, ''));
    // Fill in PropertyDeclarations for properties used by ES6 classes
    logger_1.default.info('Adding property declarations to JS Classes...');
    tsAstProject = (0, add_class_property_declarations_1.addClassPropertyDeclarations)(tsAstProject);
    // Rename .js files to .ts files
    logger_1.default.info('Renaming .js files to .ts');
    tsAstProject.getSourceFiles().forEach(sourceFile => {
        const ext = sourceFile.getExtension();
        if (ext === '.js' || ext === '.jsx') {
            const dir = sourceFile.getDirectoryPath();
            const basename = sourceFile.getBaseNameWithoutExtension();
            // in case there's a '.js' file which has JSX in it
            const fileHasJsx = sourceFile.getFirstDescendantByKind(ts_morph_1.SyntaxKind.JsxElement)
                || sourceFile.getFirstDescendantByKind(ts_morph_1.SyntaxKind.JsxSelfClosingElement);
            const extension = (fileHasJsx || ext === '.jsx') ? 'tsx' : 'ts';
            const outputFilePath = `${dir}/${basename}.${extension}`;
            logger_1.default.debug(`  Renaming ${sourceFile.getFilePath()} to ${outputFilePath}`);
            sourceFile.move(outputFilePath);
        }
    });
    // Filter out any node_modules files that accidentally got included by an import.
    // We don't want to modify these when we save the project
    tsAstProject = (0, filter_out_node_modules_1.filterOutNodeModules)(tsAstProject);
    // Make function parameters optional for calls that supply fewer arguments
    // than there are function parameters.
    // NOTE: Must happen after .js -> .ts rename for the TypeScript Language
    // Service to work.
    logger_1.default.info('Making parameters optional for calls that supply fewer args than function parameters...');
    tsAstProject = (0, add_optionals_to_function_params_1.addOptionalsToFunctionParams)(tsAstProject);
    // Filter out any node_modules files as we don't want to modify these when
    // we save the project. Also, some .d.ts files get included for some reason
    // like tslib.d.ts, so we don't want to output that as well.
    tsAstProject = (0, filter_out_node_modules_1.filterOutNodeModules)(tsAstProject);
    // Print output files
    logger_1.default.info('Outputting .ts files:');
    printSourceFilesList(tsAstProject, '  ');
    // Even though the `tsAstProject` has been mutated (it is not an immutable
    // data structure), return it anyway to avoid the confusion of an output
    // parameter.
    return tsAstProject;
}
exports.convert = convert;
/**
 * Private helper to print out the source files list in the given `astProject`
 * to the console.
 */
function printSourceFilesList(astProject, indent = '') {
    astProject.getSourceFiles().forEach(sf => {
        logger_1.default.info(`${indent}${sf.getFilePath()}`);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb252ZXJ0ZXIvY29udmVydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx1Q0FBK0M7QUFDL0MsdUhBQWlIO0FBQ2pILHlGQUFrRjtBQUNsRix1RUFBaUU7QUFDakUsOERBQXNDO0FBRXRDOztHQUVHO0FBQ0gsU0FBZ0IsT0FBTyxDQUFFLFlBQXFCO0lBQzdDLElBQUksWUFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUc7UUFDaEQsZ0JBQU0sQ0FBQyxJQUFJLENBQUUsNENBQTRDLENBQUUsQ0FBQztRQUM1RCxPQUFPLFlBQVksQ0FBQztLQUNwQjtJQUVELG9CQUFvQjtJQUNwQixnQkFBTSxDQUFDLElBQUksQ0FBRSx3Q0FBd0MsQ0FBRSxDQUFDO0lBQ3hELG9CQUFvQixDQUFFLFlBQVksRUFBRSxJQUFJLENBQUUsQ0FBQztJQUUzQyxnQkFBTSxDQUFDLElBQUksQ0FBRTs7OztFQUlaLENBQUMsT0FBTyxDQUFFLE9BQU8sRUFBRSxFQUFFLENBQUUsQ0FBRSxDQUFDO0lBRTNCLGtFQUFrRTtJQUNsRSxnQkFBTSxDQUFDLElBQUksQ0FBRSwrQ0FBK0MsQ0FBRSxDQUFDO0lBQy9ELFlBQVksR0FBRyxJQUFBLDhEQUE0QixFQUFFLFlBQVksQ0FBRSxDQUFDO0lBRTVELGdDQUFnQztJQUNoQyxnQkFBTSxDQUFDLElBQUksQ0FBRSwyQkFBMkIsQ0FBRSxDQUFDO0lBQzNDLFlBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUUsVUFBVSxDQUFDLEVBQUU7UUFDbkQsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRXRDLElBQUksR0FBRyxLQUFLLEtBQUssSUFBSSxHQUFHLEtBQUssTUFBTSxFQUFHO1lBQ3JDLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzFDLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBRTFELG1EQUFtRDtZQUNuRCxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsd0JBQXdCLENBQUUscUJBQVUsQ0FBQyxVQUFVLENBQUU7bUJBQzNFLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBRSxxQkFBVSxDQUFDLHFCQUFxQixDQUFFLENBQUM7WUFDNUUsTUFBTSxTQUFTLEdBQUcsQ0FBRSxVQUFVLElBQUksR0FBRyxLQUFLLE1BQU0sQ0FBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNsRSxNQUFNLGNBQWMsR0FBRyxHQUFHLEdBQUcsSUFBSSxRQUFRLElBQUksU0FBUyxFQUFFLENBQUM7WUFFekQsZ0JBQU0sQ0FBQyxLQUFLLENBQUUsY0FBYyxVQUFVLENBQUMsV0FBVyxFQUFFLE9BQU8sY0FBYyxFQUFFLENBQUUsQ0FBQztZQUM5RSxVQUFVLENBQUMsSUFBSSxDQUFFLGNBQWMsQ0FBRSxDQUFDO1NBQ2xDO0lBQ0YsQ0FBQyxDQUFFLENBQUM7SUFFSixpRkFBaUY7SUFDakYseURBQXlEO0lBQ3pELFlBQVksR0FBRyxJQUFBLDhDQUFvQixFQUFFLFlBQVksQ0FBRSxDQUFDO0lBRXBELDBFQUEwRTtJQUMxRSxzQ0FBc0M7SUFDdEMsd0VBQXdFO0lBQ3hFLG1CQUFtQjtJQUNuQixnQkFBTSxDQUFDLElBQUksQ0FBRSx5RkFBeUYsQ0FBRSxDQUFDO0lBQ3pHLFlBQVksR0FBRyxJQUFBLCtEQUE0QixFQUFFLFlBQVksQ0FBRSxDQUFDO0lBRTVELDBFQUEwRTtJQUMxRSwyRUFBMkU7SUFDM0UsNERBQTREO0lBQzVELFlBQVksR0FBRyxJQUFBLDhDQUFvQixFQUFFLFlBQVksQ0FBRSxDQUFDO0lBRXBELHFCQUFxQjtJQUNyQixnQkFBTSxDQUFDLElBQUksQ0FBRSx1QkFBdUIsQ0FBRSxDQUFDO0lBQ3ZDLG9CQUFvQixDQUFFLFlBQVksRUFBRSxJQUFJLENBQUUsQ0FBQztJQUUzQywwRUFBMEU7SUFDMUUsd0VBQXdFO0lBQ3hFLGFBQWE7SUFDYixPQUFPLFlBQVksQ0FBQztBQUNyQixDQUFDO0FBaEVELDBCQWdFQztBQUdEOzs7R0FHRztBQUNILFNBQVMsb0JBQW9CLENBQUUsVUFBbUIsRUFBRSxNQUFNLEdBQUcsRUFBRTtJQUM5RCxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUMsT0FBTyxDQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQ3pDLGdCQUFNLENBQUMsSUFBSSxDQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFFLENBQUM7SUFDL0MsQ0FBQyxDQUFFLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJvamVjdCwgU3ludGF4S2luZCB9IGZyb20gXCJ0cy1tb3JwaFwiO1xuaW1wb3J0IHsgYWRkQ2xhc3NQcm9wZXJ0eURlY2xhcmF0aW9ucyB9IGZyb20gXCIuL2FkZC1jbGFzcy1wcm9wZXJ0eS1kZWNsYXJhdGlvbnMvYWRkLWNsYXNzLXByb3BlcnR5LWRlY2xhcmF0aW9uc1wiO1xuaW1wb3J0IHsgYWRkT3B0aW9uYWxzVG9GdW5jdGlvblBhcmFtcyB9IGZyb20gXCIuL2FkZC1vcHRpb25hbHMtdG8tZnVuY3Rpb24tcGFyYW1zXCI7XG5pbXBvcnQgeyBmaWx0ZXJPdXROb2RlTW9kdWxlcyB9IGZyb20gXCIuL2ZpbHRlci1vdXQtbm9kZS1tb2R1bGVzXCI7XG5pbXBvcnQgbG9nZ2VyIGZyb20gXCIuLi9sb2dnZXIvbG9nZ2VyXCI7XG5cbi8qKlxuICogQ29udmVydHMgdGhlIHNvdXJjZSAuanMgY29kZSB0byAudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnQoIHRzQXN0UHJvamVjdDogUHJvamVjdCApOiBQcm9qZWN0IHtcblx0aWYoIHRzQXN0UHJvamVjdC5nZXRTb3VyY2VGaWxlcygpLmxlbmd0aCA9PT0gMCApIHtcblx0XHRsb2dnZXIuaW5mbyggJ0ZvdW5kIG5vIHNvdXJjZSBmaWxlcyB0byBwcm9jZXNzLiBFeGl0aW5nLicgKTtcblx0XHRyZXR1cm4gdHNBc3RQcm9qZWN0O1xuXHR9XG5cblx0Ly8gUHJpbnQgaW5wdXQgZmlsZXNcblx0bG9nZ2VyLmluZm8oICdQcm9jZXNzaW5nIHRoZSBmb2xsb3dpbmcgc291cmNlIGZpbGVzOicgKTtcblx0cHJpbnRTb3VyY2VGaWxlc0xpc3QoIHRzQXN0UHJvamVjdCwgJyAgJyApO1xuXG5cdGxvZ2dlci5pbmZvKCBgXG5cdFx0Q29udmVydGluZyBzb3VyY2UgZmlsZXMuLi4gVGhpcyBtYXkgdGFrZSBhbnl3aGVyZSBmcm9tIGEgZmV3IG1pbnV0ZXMgdG8gXG5cdFx0dGVucyBvZiBtaW51dGVzIG9yIGxvbmdlciBkZXBlbmRpbmcgb24gaG93IG1hbnkgZmlsZXMgYXJlIGJlaW5nIFxuXHRcdGNvbnZlcnRlZC5cblx0YC5yZXBsYWNlKCAvXFx0Ki9nbSwgJycgKSApO1xuXG5cdC8vIEZpbGwgaW4gUHJvcGVydHlEZWNsYXJhdGlvbnMgZm9yIHByb3BlcnRpZXMgdXNlZCBieSBFUzYgY2xhc3Nlc1xuXHRsb2dnZXIuaW5mbyggJ0FkZGluZyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgdG8gSlMgQ2xhc3Nlcy4uLicgKTtcblx0dHNBc3RQcm9qZWN0ID0gYWRkQ2xhc3NQcm9wZXJ0eURlY2xhcmF0aW9ucyggdHNBc3RQcm9qZWN0ICk7XG5cblx0Ly8gUmVuYW1lIC5qcyBmaWxlcyB0byAudHMgZmlsZXNcblx0bG9nZ2VyLmluZm8oICdSZW5hbWluZyAuanMgZmlsZXMgdG8gLnRzJyApO1xuXHR0c0FzdFByb2plY3QuZ2V0U291cmNlRmlsZXMoKS5mb3JFYWNoKCBzb3VyY2VGaWxlID0+IHtcblx0XHRjb25zdCBleHQgPSBzb3VyY2VGaWxlLmdldEV4dGVuc2lvbigpO1xuXG5cdFx0aWYoIGV4dCA9PT0gJy5qcycgfHwgZXh0ID09PSAnLmpzeCcgKSB7XG5cdFx0XHRjb25zdCBkaXIgPSBzb3VyY2VGaWxlLmdldERpcmVjdG9yeVBhdGgoKTtcblx0XHRcdGNvbnN0IGJhc2VuYW1lID0gc291cmNlRmlsZS5nZXRCYXNlTmFtZVdpdGhvdXRFeHRlbnNpb24oKTtcblxuXHRcdFx0Ly8gaW4gY2FzZSB0aGVyZSdzIGEgJy5qcycgZmlsZSB3aGljaCBoYXMgSlNYIGluIGl0XG5cdFx0XHRjb25zdCBmaWxlSGFzSnN4ID0gc291cmNlRmlsZS5nZXRGaXJzdERlc2NlbmRhbnRCeUtpbmQoIFN5bnRheEtpbmQuSnN4RWxlbWVudCApXG5cdFx0XHRcdHx8IHNvdXJjZUZpbGUuZ2V0Rmlyc3REZXNjZW5kYW50QnlLaW5kKCBTeW50YXhLaW5kLkpzeFNlbGZDbG9zaW5nRWxlbWVudCApO1xuXHRcdFx0Y29uc3QgZXh0ZW5zaW9uID0gKCBmaWxlSGFzSnN4IHx8IGV4dCA9PT0gJy5qc3gnICkgPyAndHN4JyA6ICd0cyc7XG5cdFx0XHRjb25zdCBvdXRwdXRGaWxlUGF0aCA9IGAke2Rpcn0vJHtiYXNlbmFtZX0uJHtleHRlbnNpb259YDtcblxuXHRcdFx0bG9nZ2VyLmRlYnVnKCBgICBSZW5hbWluZyAke3NvdXJjZUZpbGUuZ2V0RmlsZVBhdGgoKX0gdG8gJHtvdXRwdXRGaWxlUGF0aH1gICk7XG5cdFx0XHRzb3VyY2VGaWxlLm1vdmUoIG91dHB1dEZpbGVQYXRoICk7XG5cdFx0fVxuXHR9ICk7XG5cblx0Ly8gRmlsdGVyIG91dCBhbnkgbm9kZV9tb2R1bGVzIGZpbGVzIHRoYXQgYWNjaWRlbnRhbGx5IGdvdCBpbmNsdWRlZCBieSBhbiBpbXBvcnQuXG5cdC8vIFdlIGRvbid0IHdhbnQgdG8gbW9kaWZ5IHRoZXNlIHdoZW4gd2Ugc2F2ZSB0aGUgcHJvamVjdFxuXHR0c0FzdFByb2plY3QgPSBmaWx0ZXJPdXROb2RlTW9kdWxlcyggdHNBc3RQcm9qZWN0ICk7XG5cblx0Ly8gTWFrZSBmdW5jdGlvbiBwYXJhbWV0ZXJzIG9wdGlvbmFsIGZvciBjYWxscyB0aGF0IHN1cHBseSBmZXdlciBhcmd1bWVudHNcblx0Ly8gdGhhbiB0aGVyZSBhcmUgZnVuY3Rpb24gcGFyYW1ldGVycy5cblx0Ly8gTk9URTogTXVzdCBoYXBwZW4gYWZ0ZXIgLmpzIC0+IC50cyByZW5hbWUgZm9yIHRoZSBUeXBlU2NyaXB0IExhbmd1YWdlXG5cdC8vIFNlcnZpY2UgdG8gd29yay5cblx0bG9nZ2VyLmluZm8oICdNYWtpbmcgcGFyYW1ldGVycyBvcHRpb25hbCBmb3IgY2FsbHMgdGhhdCBzdXBwbHkgZmV3ZXIgYXJncyB0aGFuIGZ1bmN0aW9uIHBhcmFtZXRlcnMuLi4nICk7XG5cdHRzQXN0UHJvamVjdCA9IGFkZE9wdGlvbmFsc1RvRnVuY3Rpb25QYXJhbXMoIHRzQXN0UHJvamVjdCApO1xuXG5cdC8vIEZpbHRlciBvdXQgYW55IG5vZGVfbW9kdWxlcyBmaWxlcyBhcyB3ZSBkb24ndCB3YW50IHRvIG1vZGlmeSB0aGVzZSB3aGVuXG5cdC8vIHdlIHNhdmUgdGhlIHByb2plY3QuIEFsc28sIHNvbWUgLmQudHMgZmlsZXMgZ2V0IGluY2x1ZGVkIGZvciBzb21lIHJlYXNvblxuXHQvLyBsaWtlIHRzbGliLmQudHMsIHNvIHdlIGRvbid0IHdhbnQgdG8gb3V0cHV0IHRoYXQgYXMgd2VsbC5cblx0dHNBc3RQcm9qZWN0ID0gZmlsdGVyT3V0Tm9kZU1vZHVsZXMoIHRzQXN0UHJvamVjdCApO1xuXG5cdC8vIFByaW50IG91dHB1dCBmaWxlc1xuXHRsb2dnZXIuaW5mbyggJ091dHB1dHRpbmcgLnRzIGZpbGVzOicgKTtcblx0cHJpbnRTb3VyY2VGaWxlc0xpc3QoIHRzQXN0UHJvamVjdCwgJyAgJyApO1xuXG5cdC8vIEV2ZW4gdGhvdWdoIHRoZSBgdHNBc3RQcm9qZWN0YCBoYXMgYmVlbiBtdXRhdGVkIChpdCBpcyBub3QgYW4gaW1tdXRhYmxlXG5cdC8vIGRhdGEgc3RydWN0dXJlKSwgcmV0dXJuIGl0IGFueXdheSB0byBhdm9pZCB0aGUgY29uZnVzaW9uIG9mIGFuIG91dHB1dFxuXHQvLyBwYXJhbWV0ZXIuXG5cdHJldHVybiB0c0FzdFByb2plY3Q7XG59XG5cblxuLyoqXG4gKiBQcml2YXRlIGhlbHBlciB0byBwcmludCBvdXQgdGhlIHNvdXJjZSBmaWxlcyBsaXN0IGluIHRoZSBnaXZlbiBgYXN0UHJvamVjdGBcbiAqIHRvIHRoZSBjb25zb2xlLlxuICovXG5mdW5jdGlvbiBwcmludFNvdXJjZUZpbGVzTGlzdCggYXN0UHJvamVjdDogUHJvamVjdCwgaW5kZW50ID0gJycgKSB7XG5cdGFzdFByb2plY3QuZ2V0U291cmNlRmlsZXMoKS5mb3JFYWNoKCBzZiA9PiB7XG5cdFx0bG9nZ2VyLmluZm8oIGAke2luZGVudH0ke3NmLmdldEZpbGVQYXRoKCl9YCApO1xuXHR9ICk7XG59Il19