import { ElementAccessExpression, Node, PropertyAccessExpression } from "ts-simple-ast";
/**
 * Determines if the given `node` is a PropertyAccessExpression or
 * ElementAccessExpression whose object is `obj`.
 *
 * Example, in the following expression:
 *
 *     obj.a
 *
 * This function will return true if called as:
 *
 *     isPropertyOrElemementAccessWithObj( expr, 'obj' );
 */
export declare function isPropOrElemAccessWithObj(node: Node, objIdentifier: string): node is PropertyAccessExpression | ElementAccessExpression;
/**
 * Function intended to be used with Array.prototype.filter() to return any
 * PropertyAccessExpression or ElementAccessExpression that uses the object
 * `obj`.
 *
 * For example, in this source code:
 *
 *     const obj = { a: 1, b: 2 };
 *     obj.a = 3;
 *     obj['b'] = 4;
 *
 *     const obj2 = { a: 3, b: 4 };
 *     obj2.a = 5;
 *     obj2['b'] = 6;
 *
 * We can use the following to find the two 'obj2' property accesses:
 *
 *     const propAccesses = sourceFile
 *         .getDescendantsOfKind( SyntaxKind.PropertyAccessExpression );
 *
 *     const obj2PropAccesses = propAccesses
 *         .filter( topLevelPropOrElemAccessFilter( 'obj2' ) );
 */
export declare function propOrElemAccessWithObjFilter(objIdentifier: string): (node: Node<import("../../../../../../Users/gjacobs/dev/js-to-ts-converter/node_modules/ts-simple-ast/dist/typescript/typescript").ts.Node>) => node is ElementAccessExpression<import("../../../../../../Users/gjacobs/dev/js-to-ts-converter/node_modules/ts-simple-ast/dist/typescript/typescript").ts.ElementAccessExpression> | PropertyAccessExpression<import("../../../../../../Users/gjacobs/dev/js-to-ts-converter/node_modules/ts-simple-ast/dist/typescript/typescript").ts.PropertyAccessExpression>;
