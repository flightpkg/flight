import { Project } from "ts-morph";
/**
 * Given a Project, removes all files that are under the node_modules folder.
 *
 * It seems the language service can pull in some .d.ts files from node_modules
 * that we don't want to be output after we save.
 */
export declare function filterOutNodeModules(tsAstProject: Project): Project;
