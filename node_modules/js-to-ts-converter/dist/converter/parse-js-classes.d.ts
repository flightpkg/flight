import Project from "ts-simple-ast";
import { JsClass } from "../model/js-class";
/**
 * Parses the classes out of each .js file in the SourceFilesCollection, and
 * forms a tree representing their hierarchy.
 *
 * ## Description of algorithm:
 *
 * Each source file is parsed to find all file-level classes. Their superclasses
 * and import paths for those superclasses are also recorded to form an
 * adjacency list graph of classes keyed by their file path.
 *
 * Each class is also processed to find and record any property accesses of the
 * `this` object. For instance, in the following class, there are 3
 * PropertyAccessExpressions that pull from the `this` object ('something1',
 * 'something2', and 'something3'):
 *
 *     class Something {
 *         constructor() {
 *             this.something1 = 1;
 *             this.something2 = 2;
 *         }
 *
 *         someMethod() {
 *             console.log( this.something3 );
 *
 *             console.log( window.location );  // <-- not a `this` PropertyAccessExpression
 *         }
 *     }
 *
 * The returned graph will be used later to determine which TS class property
 * definitions should be placed in superclasses vs. subclasses. Properties used
 * by a superclass and a subclass should only be defined in the superclass.
 */
export declare function parseJsClasses(tsAstProject: Project): JsClass[];
