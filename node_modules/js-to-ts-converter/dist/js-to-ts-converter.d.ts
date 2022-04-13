import { IndentationText } from "ts-morph";
import { LogLevel } from "./logger";
export interface JsToTsConverterOptions {
    indentationText?: IndentationText;
    logLevel?: LogLevel;
    includePatterns?: string[];
    excludePatterns?: string[];
}
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
export declare function convertJsToTs(sourceFilesPath: string, options?: JsToTsConverterOptions): Promise<void>;
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
export declare function convertJsToTsSync(sourceFilesPath: string, options?: JsToTsConverterOptions): void;
