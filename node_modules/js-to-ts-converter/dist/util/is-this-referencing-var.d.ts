import { Node, VariableDeclaration } from "ts-morph";
/**
 * Determines if the given AST Node is a VariableDeclaration of the form:
 *
 *     var self = this;
 *
 *
 * Will return false for the following, however, since this is a destructuring
 * of the `this` object's properties.
 *
 *     var { prop1, prop2 } = this;
 */
export declare function isThisReferencingVar(node: Node): node is VariableDeclaration;
