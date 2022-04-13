import { Project, IndentationText } from "ts-morph";
/**
 * Creates a ts-morph Project by including the source files under the given
 * `directory`.
 *
 * @param directory The absolute path to the directory of .js files to
 *   include.
 * @param options
 * @param options.indentationText The text used to indent new class property
 *   declarations.
 * @param options.excludePatterns Glob patterns to exclude files.
 */
export declare function createTsAstProject(directory: string, options?: {
    indentationText?: IndentationText;
    includePatterns?: string[];
    excludePatterns?: string[];
}): Project;
