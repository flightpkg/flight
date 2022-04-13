import { ImportDeclaration, SourceFile } from "ts-morph";
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
export declare function findImportForIdentifier(sourceFile: SourceFile, identifier: string): ImportDeclaration | undefined;
