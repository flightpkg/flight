import { ClassDeclaration, SourceFile } from "ts-morph";
/**
 * Given a file and ClassDeclaration, finds the name of the superclass and the
 * full path to the module (file) that hosts the superclass.
 *
 * `superclass` and `superclassPath` in the return object will be `null` if
 * there is no superclass.
 */
export declare function parseSuperclassNameAndPath(file: SourceFile, fileClass: ClassDeclaration): {
    superclassName: string | undefined;
    superclassPath: string | undefined;
};
