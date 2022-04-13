import { Node, PropertyAccessExpression } from "ts-morph";
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
export declare function isPropertyAccessWithObj(node: Node, objIdentifier: string): node is PropertyAccessExpression;
/**
 * Function intended to be used with Array.prototype.filter() to return any
 * PropertyAccessExpression that uses the object `obj`.
 *
 * For example, in this source code:
 *
 *     const obj = { a: 1, b: 2 };
 *     obj.a = 3;
 *
 *     const obj2 = { a: 3, b: 4 };
 *     obj2.b = 5;
 *
 * We can use the following to find the 'obj2' property access:
 *
 *     const propAccesses = sourceFile
 *         .getDescendantsOfKind( SyntaxKind.PropertyAccessExpression );
 *
 *     const obj2PropAccesses = propAccesses
 *         .filter( propAccessWithObjFilter( 'obj2' ) );
 */
export declare function propertyAccessWithObjFilter(objIdentifier: string): (node: Node) => node is PropertyAccessExpression;
