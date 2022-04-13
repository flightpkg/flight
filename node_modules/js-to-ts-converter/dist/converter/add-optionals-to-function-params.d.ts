import { Project } from "ts-morph";
/**
 * Adds the question token to function/method/constructor parameters that are
 * deemed to be optional based on the calls to that function/method/constructor
 * in the codebase.
 *
 * For example, if we have:
 *
 *     function myFn( arg1, arg2, arg3 ) {
 *         // ...
 *     }
 *
 *     myFn( 1, 2, 3 );  // all 3 args provided
 *     myFn( 1, 2 );     // <-- a call site only provides two arguments
 *
 * Then the resulting TypeScript function will be:
 *
 *     function myFn( arg1, arg2, arg3? ) {   // <-- arg3 marked as optional
 *         // ...
 *     }
 *
 * Note: Just calling the language service to look up references takes a lot of
 * time. Might have to optimize this somehow in the future.
 */
export declare function addOptionalsToFunctionParams(tsAstProject: Project): Project;
