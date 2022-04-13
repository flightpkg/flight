"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertJsToTsSync = exports.convertJsToTs = void 0;
const path = __importStar(require("path"));
const create_ts_morph_project_1 = require("./create-ts-morph-project");
const convert_1 = require("./converter/convert");
const logger_1 = __importDefault(require("./logger/logger"));
/**
 * Asynchronously converts the JavaScript files under the given `sourceFilesPath`
 * to TypeScript files.
 *
 * @param sourceFilesPath The path to the source files to convert
 * @param [options]
 * @param [options.indentationText] The text used to indent new class property
 *   declarations.
 * @param [options.logLevel] The level of logging to show on the console.
 *   One of: 'debug', 'verbose', 'info', 'warn', 'error'
 * @param [options.includePatterns] Glob patterns to include files.
 * @param [options.excludePatterns] Glob patterns to exclude files.
 */
async function convertJsToTs(sourceFilesPath, options = {}) {
    const convertedTsAstProject = doConvert(sourceFilesPath, options);
    // Save output files
    return convertedTsAstProject.save();
}
exports.convertJsToTs = convertJsToTs;
/**
 * Synchronously converts the JavaScript files under the given `sourceFilesPath`
 * to TypeScript files.
 *
 * @param sourceFilesPath The path to the source files to convert
 * @param [options]
 * @param [options.indentationText] The text used to indent new class property
 *   declarations.
 * @param [options.logLevel] The level of logging to show on the console.
 *   One of: 'debug', 'verbose', 'info', 'warn', 'error'
 * @param [options.includePatterns] Glob patterns to include files.
 * @param [options.excludePatterns] Glob patterns to exclude files.
 */
function convertJsToTsSync(sourceFilesPath, options = {}) {
    const convertedTsAstProject = doConvert(sourceFilesPath, options);
    // Save output files
    convertedTsAstProject.saveSync();
}
exports.convertJsToTsSync = convertJsToTsSync;
/**
 * Performs the actual conversion given a `sourceFilesPath`, and returning a
 * `ts-morph` Project with the converted source files.
 *
 * @param sourceFilesPath The path to the source files to convert
 * @param [options]
 * @param [options.indentationText] The text used to indent new class property
 *   declarations.
 * @param [options.logLevel] The level of logging to show on the console.
 *   One of: 'debug', 'verbose', 'info', 'warn', 'error'
 * @param [options.includePatterns] Glob patterns to include files.
 * @param [options.excludePatterns] Glob patterns to exclude files.
 */
function doConvert(sourceFilesPath, options = {}) {
    logger_1.default.setLogLevel(options.logLevel || 'verbose');
    const absolutePath = path.resolve(sourceFilesPath);
    const tsAstProject = (0, create_ts_morph_project_1.createTsMorphProject)(absolutePath, options);
    return (0, convert_1.convert)(tsAstProject);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMtdG8tdHMtY29udmVydGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2pzLXRvLXRzLWNvbnZlcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUE2QjtBQUM3Qix1RUFBaUU7QUFDakUsaURBQThDO0FBRzlDLDZEQUFxQztBQVNyQzs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSSxLQUFLLFVBQVUsYUFBYSxDQUNsQyxlQUF1QixFQUN2QixVQUFrQyxFQUFFO0lBRXBDLE1BQU0scUJBQXFCLEdBQUcsU0FBUyxDQUFFLGVBQWUsRUFBRSxPQUFPLENBQUUsQ0FBQztJQUVwRSxvQkFBb0I7SUFDcEIsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyQyxDQUFDO0FBUkQsc0NBUUM7QUFFRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxTQUFnQixpQkFBaUIsQ0FDaEMsZUFBdUIsRUFDdkIsVUFBa0MsRUFBRTtJQUVwQyxNQUFNLHFCQUFxQixHQUFHLFNBQVMsQ0FBRSxlQUFlLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFFcEUsb0JBQW9CO0lBQ3BCLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2xDLENBQUM7QUFSRCw4Q0FRQztBQUdEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILFNBQVMsU0FBUyxDQUNqQixlQUF1QixFQUN2QixVQUFrQyxFQUFFO0lBRXBDLGdCQUFNLENBQUMsV0FBVyxDQUFFLE9BQU8sQ0FBQyxRQUFRLElBQUksU0FBUyxDQUFFLENBQUM7SUFFcEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBRSxlQUFlLENBQUUsQ0FBQztJQUVyRCxNQUFNLFlBQVksR0FBRyxJQUFBLDhDQUFvQixFQUFFLFlBQVksRUFBRSxPQUFPLENBQUUsQ0FBQztJQUNuRSxPQUFPLElBQUEsaUJBQU8sRUFBRSxZQUFZLENBQUUsQ0FBQztBQUNoQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGNyZWF0ZVRzTW9ycGhQcm9qZWN0IH0gZnJvbSBcIi4vY3JlYXRlLXRzLW1vcnBoLXByb2plY3RcIjtcbmltcG9ydCB7IGNvbnZlcnQgfSBmcm9tIFwiLi9jb252ZXJ0ZXIvY29udmVydFwiO1xuaW1wb3J0IHsgUHJvamVjdCwgSW5kZW50YXRpb25UZXh0IH0gZnJvbSBcInRzLW1vcnBoXCI7XG5pbXBvcnQgeyBMb2dMZXZlbCB9IGZyb20gXCIuL2xvZ2dlclwiO1xuaW1wb3J0IGxvZ2dlciBmcm9tIFwiLi9sb2dnZXIvbG9nZ2VyXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSnNUb1RzQ29udmVydGVyT3B0aW9ucyB7XG5cdGluZGVudGF0aW9uVGV4dD86IEluZGVudGF0aW9uVGV4dCxcblx0bG9nTGV2ZWw/OiBMb2dMZXZlbCxcblx0aW5jbHVkZVBhdHRlcm5zPzogc3RyaW5nW10sXG5cdGV4Y2x1ZGVQYXR0ZXJucz86IHN0cmluZ1tdXG59XG5cbi8qKlxuICogQXN5bmNocm9ub3VzbHkgY29udmVydHMgdGhlIEphdmFTY3JpcHQgZmlsZXMgdW5kZXIgdGhlIGdpdmVuIGBzb3VyY2VGaWxlc1BhdGhgXG4gKiB0byBUeXBlU2NyaXB0IGZpbGVzLlxuICpcbiAqIEBwYXJhbSBzb3VyY2VGaWxlc1BhdGggVGhlIHBhdGggdG8gdGhlIHNvdXJjZSBmaWxlcyB0byBjb252ZXJ0XG4gKiBAcGFyYW0gW29wdGlvbnNdXG4gKiBAcGFyYW0gW29wdGlvbnMuaW5kZW50YXRpb25UZXh0XSBUaGUgdGV4dCB1c2VkIHRvIGluZGVudCBuZXcgY2xhc3MgcHJvcGVydHlcbiAqICAgZGVjbGFyYXRpb25zLlxuICogQHBhcmFtIFtvcHRpb25zLmxvZ0xldmVsXSBUaGUgbGV2ZWwgb2YgbG9nZ2luZyB0byBzaG93IG9uIHRoZSBjb25zb2xlLlxuICogICBPbmUgb2Y6ICdkZWJ1ZycsICd2ZXJib3NlJywgJ2luZm8nLCAnd2FybicsICdlcnJvcidcbiAqIEBwYXJhbSBbb3B0aW9ucy5pbmNsdWRlUGF0dGVybnNdIEdsb2IgcGF0dGVybnMgdG8gaW5jbHVkZSBmaWxlcy5cbiAqIEBwYXJhbSBbb3B0aW9ucy5leGNsdWRlUGF0dGVybnNdIEdsb2IgcGF0dGVybnMgdG8gZXhjbHVkZSBmaWxlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbnZlcnRKc1RvVHMoXG5cdHNvdXJjZUZpbGVzUGF0aDogc3RyaW5nLFxuXHRvcHRpb25zOiBKc1RvVHNDb252ZXJ0ZXJPcHRpb25zID0ge31cbik6IFByb21pc2U8dm9pZD4ge1xuXHRjb25zdCBjb252ZXJ0ZWRUc0FzdFByb2plY3QgPSBkb0NvbnZlcnQoIHNvdXJjZUZpbGVzUGF0aCwgb3B0aW9ucyApO1xuXG5cdC8vIFNhdmUgb3V0cHV0IGZpbGVzXG5cdHJldHVybiBjb252ZXJ0ZWRUc0FzdFByb2plY3Quc2F2ZSgpO1xufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzbHkgY29udmVydHMgdGhlIEphdmFTY3JpcHQgZmlsZXMgdW5kZXIgdGhlIGdpdmVuIGBzb3VyY2VGaWxlc1BhdGhgXG4gKiB0byBUeXBlU2NyaXB0IGZpbGVzLlxuICpcbiAqIEBwYXJhbSBzb3VyY2VGaWxlc1BhdGggVGhlIHBhdGggdG8gdGhlIHNvdXJjZSBmaWxlcyB0byBjb252ZXJ0XG4gKiBAcGFyYW0gW29wdGlvbnNdXG4gKiBAcGFyYW0gW29wdGlvbnMuaW5kZW50YXRpb25UZXh0XSBUaGUgdGV4dCB1c2VkIHRvIGluZGVudCBuZXcgY2xhc3MgcHJvcGVydHlcbiAqICAgZGVjbGFyYXRpb25zLlxuICogQHBhcmFtIFtvcHRpb25zLmxvZ0xldmVsXSBUaGUgbGV2ZWwgb2YgbG9nZ2luZyB0byBzaG93IG9uIHRoZSBjb25zb2xlLlxuICogICBPbmUgb2Y6ICdkZWJ1ZycsICd2ZXJib3NlJywgJ2luZm8nLCAnd2FybicsICdlcnJvcidcbiAqIEBwYXJhbSBbb3B0aW9ucy5pbmNsdWRlUGF0dGVybnNdIEdsb2IgcGF0dGVybnMgdG8gaW5jbHVkZSBmaWxlcy5cbiAqIEBwYXJhbSBbb3B0aW9ucy5leGNsdWRlUGF0dGVybnNdIEdsb2IgcGF0dGVybnMgdG8gZXhjbHVkZSBmaWxlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRKc1RvVHNTeW5jKFxuXHRzb3VyY2VGaWxlc1BhdGg6IHN0cmluZyxcblx0b3B0aW9uczogSnNUb1RzQ29udmVydGVyT3B0aW9ucyA9IHt9XG4pIHtcblx0Y29uc3QgY29udmVydGVkVHNBc3RQcm9qZWN0ID0gZG9Db252ZXJ0KCBzb3VyY2VGaWxlc1BhdGgsIG9wdGlvbnMgKTtcblxuXHQvLyBTYXZlIG91dHB1dCBmaWxlc1xuXHRjb252ZXJ0ZWRUc0FzdFByb2plY3Quc2F2ZVN5bmMoKTtcbn1cblxuXG4vKipcbiAqIFBlcmZvcm1zIHRoZSBhY3R1YWwgY29udmVyc2lvbiBnaXZlbiBhIGBzb3VyY2VGaWxlc1BhdGhgLCBhbmQgcmV0dXJuaW5nIGFcbiAqIGB0cy1tb3JwaGAgUHJvamVjdCB3aXRoIHRoZSBjb252ZXJ0ZWQgc291cmNlIGZpbGVzLlxuICpcbiAqIEBwYXJhbSBzb3VyY2VGaWxlc1BhdGggVGhlIHBhdGggdG8gdGhlIHNvdXJjZSBmaWxlcyB0byBjb252ZXJ0XG4gKiBAcGFyYW0gW29wdGlvbnNdXG4gKiBAcGFyYW0gW29wdGlvbnMuaW5kZW50YXRpb25UZXh0XSBUaGUgdGV4dCB1c2VkIHRvIGluZGVudCBuZXcgY2xhc3MgcHJvcGVydHlcbiAqICAgZGVjbGFyYXRpb25zLlxuICogQHBhcmFtIFtvcHRpb25zLmxvZ0xldmVsXSBUaGUgbGV2ZWwgb2YgbG9nZ2luZyB0byBzaG93IG9uIHRoZSBjb25zb2xlLlxuICogICBPbmUgb2Y6ICdkZWJ1ZycsICd2ZXJib3NlJywgJ2luZm8nLCAnd2FybicsICdlcnJvcidcbiAqIEBwYXJhbSBbb3B0aW9ucy5pbmNsdWRlUGF0dGVybnNdIEdsb2IgcGF0dGVybnMgdG8gaW5jbHVkZSBmaWxlcy5cbiAqIEBwYXJhbSBbb3B0aW9ucy5leGNsdWRlUGF0dGVybnNdIEdsb2IgcGF0dGVybnMgdG8gZXhjbHVkZSBmaWxlcy5cbiAqL1xuZnVuY3Rpb24gZG9Db252ZXJ0KFxuXHRzb3VyY2VGaWxlc1BhdGg6IHN0cmluZyxcblx0b3B0aW9uczogSnNUb1RzQ29udmVydGVyT3B0aW9ucyA9IHt9XG4pOiBQcm9qZWN0IHtcblx0bG9nZ2VyLnNldExvZ0xldmVsKCBvcHRpb25zLmxvZ0xldmVsIHx8ICd2ZXJib3NlJyApO1xuXG5cdGNvbnN0IGFic29sdXRlUGF0aCA9IHBhdGgucmVzb2x2ZSggc291cmNlRmlsZXNQYXRoICk7XG5cblx0Y29uc3QgdHNBc3RQcm9qZWN0ID0gY3JlYXRlVHNNb3JwaFByb2plY3QoIGFic29sdXRlUGF0aCwgb3B0aW9ucyApO1xuXHRyZXR1cm4gY29udmVydCggdHNBc3RQcm9qZWN0ICk7XG59Il19