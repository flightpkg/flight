import { Project } from "ts-morph";
/**
 * Parses all source files looking for ES6 classes, and takes any `this`
 * property access to create a PropertyDeclaration for the class.
 *
 * For example:
 *
 *     class Something {
 *         constructor() {
 *             this.someProp = 1;
 *         }
 *     }
 *
 * Is changed to:
 *
 *     class Something {
 *         someProp: any;
 *
 *         constructor() {
 *             this.someProp = 1;
 *         }
 *     }
 */
export declare function addClassPropertyDeclarations(tsAstProject: Project): Project;
