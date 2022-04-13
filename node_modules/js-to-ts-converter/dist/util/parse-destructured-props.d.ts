import { ts } from "ts-morph";
/**
 * Given a ts.ObjectBindingPattern node, returns an array of the names that
 * are bound to it.
 *
 * These names are essentially the property names pulled out of the object.
 *
 * Example:
 *
 *     var { a, b } = this;
 *
 * Returns:
 *
 *     [ 'a', 'b' ]
 */
export declare function parseDestructuredProps(node: ts.ObjectBindingPattern): string[];
