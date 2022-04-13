import Project from "ts-simple-ast";
/**
 * Parses the classes out of each .js file in the SourceFilesCollection, and
 * transforms any function expressions found into arrow functions.
 *
 * Also removes any `var that = this;` statements, and replaces usages of the
 * variable `that` (or whichever identifier is used for it) back to `this`.
 */
export declare function convertToArrowFunctions(tsAstProject: Project): Project;
