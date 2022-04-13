"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOptionalsToFunctionParams = void 0;
const ts_morph_1 = require("ts-morph");
const logger_1 = __importDefault(require("../logger/logger"));
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
function addOptionalsToFunctionParams(tsAstProject) {
    logger_1.default.verbose('Beginning routine to mark function parameters as optional when calls exist that supply fewer args than parameters...');
    const sourceFiles = tsAstProject.getSourceFiles();
    logger_1.default.verbose('Parsing function/method/constructor calls from codebase.');
    const constructorMinArgsMap = parseClassConstructorCalls(sourceFiles);
    const functionsMinArgsMap = parseFunctionAndMethodCalls(sourceFiles);
    logger_1.default.verbose('Marking parameters as optional');
    addOptionals(constructorMinArgsMap);
    addOptionals(functionsMinArgsMap);
    return tsAstProject;
}
exports.addOptionalsToFunctionParams = addOptionalsToFunctionParams;
/**
 * Finds the call sites of each ClassDeclaration's constructor in order to
 * determine if any of its parameters should be marked as optional.
 *
 * Returns a Map keyed by ClassDeclaration which contains the minimum number of
 * arguments passed to that class's constructor.
 *
 * Actually marking the parameters as optional is done in a separate phase.
 */
function parseClassConstructorCalls(sourceFiles) {
    logger_1.default.verbose('Finding all calls to class constructors...');
    const constructorMinArgsMap = new Map();
    sourceFiles.forEach((sourceFile) => {
        logger_1.default.verbose(`  Processing classes in source file: ${sourceFile.getFilePath()}`);
        const classes = sourceFile.getDescendantsOfKind(ts_morph_1.SyntaxKind.ClassDeclaration);
        classes.forEach((classDeclaration) => {
            const constructorFns = classDeclaration.getConstructors() || [];
            const constructorFn = constructorFns.length > 0 ? constructorFns[0] : undefined; // only grab the first since we're converting JavaScript
            // If there is no constructor function for this class, then nothing to do
            if (!constructorFn) {
                return;
            }
            logger_1.default.verbose(`    Looking for calls to the constructor of class: '${classDeclaration.getName()}'`);
            const constructorFnParams = constructorFn.getParameters();
            const numParams = constructorFnParams.length;
            const referencedNodes = classDeclaration.findReferencesAsNodes();
            const callsToConstructor = referencedNodes
                .map((node) => node.getFirstAncestorByKind(ts_morph_1.SyntaxKind.NewExpression))
                .filter((node) => !!node);
            logger_1.default.debug(`    Found ${callsToConstructor.length} call(s) to the constructor`);
            const minNumberOfCallArgs = callsToConstructor
                .reduce((minCallArgs, call) => {
                return Math.min(minCallArgs, call.getArguments().length);
            }, numParams);
            if (callsToConstructor.length > 0) {
                logger_1.default.debug(`    Constructor currently expects ${numParams} params. Call(s) to the constructor supply a minimum of ${minNumberOfCallArgs} args.`);
            }
            constructorMinArgsMap.set(constructorFn, minNumberOfCallArgs);
        });
    });
    return constructorMinArgsMap;
}
/**
 * Finds the call sites of each FunctionDeclaration or MethodDeclaration in
 * order to determine if any of its parameters should be marked as optional.
 *
 * Returns a Map keyed by FunctionDeclaration or MethodDeclaration which contains
 * the minimum number of arguments passed to that function/method.
 *
 * Actually marking the parameters as optional is done in a separate phase.
 */
function parseFunctionAndMethodCalls(sourceFiles) {
    logger_1.default.verbose('Finding all calls to functions/methods...');
    const functionsMinArgsMap = new Map();
    sourceFiles.forEach((sourceFile) => {
        logger_1.default.verbose(`  Processing functions/methods in source file: ${sourceFile.getFilePath()}`);
        const fns = getFunctionsAndMethods(sourceFile);
        fns.forEach((fn) => {
            logger_1.default.verbose(`    Looking for calls to the function: '${fn.getName()}'`);
            const fnParams = fn.getParameters();
            const numParams = fnParams.length;
            const referencedNodes = fn.findReferencesAsNodes();
            const callsToFunction = referencedNodes
                .map((node) => node.getFirstAncestorByKind(ts_morph_1.SyntaxKind.CallExpression))
                .filter((node) => !!node);
            logger_1.default.debug(`    Found ${callsToFunction.length} call(s) to the function '${fn.getName()}'`);
            const minNumberOfCallArgs = callsToFunction
                .reduce((minCallArgs, call) => {
                return Math.min(minCallArgs, call.getArguments().length);
            }, numParams);
            if (callsToFunction.length > 0) {
                logger_1.default.debug(`    Function currently expects ${numParams} params. Call(s) to the function/method supply a minimum of ${minNumberOfCallArgs} args.`);
            }
            functionsMinArgsMap.set(fn, minNumberOfCallArgs);
        });
    });
    return functionsMinArgsMap;
}
/**
 * Retrieves all FunctionDeclarations and MethodDeclarations from the given
 * source file.
 */
function getFunctionsAndMethods(sourceFile) {
    return [].concat(sourceFile.getDescendantsOfKind(ts_morph_1.SyntaxKind.FunctionDeclaration), sourceFile.getDescendantsOfKind(ts_morph_1.SyntaxKind.MethodDeclaration));
}
/**
 * Marks parameters of class constructors / methods / functions as optional
 * based on the minimum number of arguments passed in at its call sites.
 *
 * Ex:
 *
 *     class SomeClass {
 *         constructor( arg1, arg2 ) {}
 *     }
 *     new SomeClass( 1 );  // no arg2
 *
 *     function myFn( arg1, arg2 ) {}
 *     myFn();  // no args
 *
 *
 * Output class and function:
 *
 *     class SomeClass {
 *         constructor( arg1, arg2? ) {}  // <-- arg2 marked as optional
 *     }
 *
 *     function myFn( arg1?, arg2? ) {}   // <-- arg1 and arg2 marked as optional
 */
function addOptionals(minArgsMap) {
    const fns = minArgsMap.keys();
    for (const fn of fns) {
        const fnParams = fn.getParameters();
        const numParams = fnParams.length;
        const minNumberOfCallArgs = minArgsMap.get(fn);
        // Mark all parameters greater than the minNumberOfCallArgs as
        // optional (if it's not a rest parameter or already has a default value)
        for (let i = minNumberOfCallArgs; i < numParams; i++) {
            const param = fnParams[i];
            if (!param.isRestParameter() && !param.hasInitializer()) {
                param.setHasQuestionToken(true);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLW9wdGlvbmFscy10by1mdW5jdGlvbi1wYXJhbXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udmVydGVyL2FkZC1vcHRpb25hbHMtdG8tZnVuY3Rpb24tcGFyYW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHVDQUFrTDtBQUNsTCw4REFBc0M7QUFLdEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSCxTQUFnQiw0QkFBNEIsQ0FBRSxZQUFxQjtJQUNsRSxnQkFBTSxDQUFDLE9BQU8sQ0FBRSxzSEFBc0gsQ0FBRSxDQUFDO0lBQ3pJLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUVsRCxnQkFBTSxDQUFDLE9BQU8sQ0FBRSwwREFBMEQsQ0FBRSxDQUFDO0lBQzdFLE1BQU0scUJBQXFCLEdBQUcsMEJBQTBCLENBQUUsV0FBVyxDQUFFLENBQUM7SUFDeEUsTUFBTSxtQkFBbUIsR0FBRywyQkFBMkIsQ0FBRSxXQUFXLENBQUUsQ0FBQztJQUV2RSxnQkFBTSxDQUFDLE9BQU8sQ0FBRSxnQ0FBZ0MsQ0FBRSxDQUFDO0lBQ25ELFlBQVksQ0FBRSxxQkFBcUIsQ0FBRSxDQUFDO0lBQ3RDLFlBQVksQ0FBRSxtQkFBbUIsQ0FBRSxDQUFDO0lBRXBDLE9BQU8sWUFBWSxDQUFDO0FBQ3JCLENBQUM7QUFiRCxvRUFhQztBQUdEOzs7Ozs7OztHQVFHO0FBQ0gsU0FBUywwQkFBMEIsQ0FBRSxXQUF5QjtJQUM3RCxnQkFBTSxDQUFDLE9BQU8sQ0FBRSw0Q0FBNEMsQ0FBRSxDQUFDO0lBQy9ELE1BQU0scUJBQXFCLEdBQUcsSUFBSSxHQUFHLEVBQWtDLENBQUM7SUFFeEUsV0FBVyxDQUFDLE9BQU8sQ0FBRSxDQUFFLFVBQXNCLEVBQUcsRUFBRTtRQUNqRCxnQkFBTSxDQUFDLE9BQU8sQ0FBRSx3Q0FBd0MsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUUsQ0FBQztRQUNyRixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsb0JBQW9CLENBQUUscUJBQVUsQ0FBQyxnQkFBZ0IsQ0FBRSxDQUFDO1FBRS9FLE9BQU8sQ0FBQyxPQUFPLENBQUUsQ0FBRSxnQkFBa0MsRUFBRyxFQUFFO1lBQ3pELE1BQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUNoRSxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFFLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBRSx3REFBd0Q7WUFFNUkseUVBQXlFO1lBQ3pFLElBQUksQ0FBQyxhQUFhLEVBQUc7Z0JBQ3BCLE9BQU87YUFDUDtZQUVELGdCQUFNLENBQUMsT0FBTyxDQUFFLHVEQUF1RCxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFFLENBQUM7WUFFdkcsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDMUQsTUFBTSxTQUFTLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDO1lBRTdDLE1BQU0sZUFBZSxHQUFHLGdCQUFnQixDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFFakUsTUFBTSxrQkFBa0IsR0FBRyxlQUFlO2lCQUN4QyxHQUFHLENBQUUsQ0FBRSxJQUFVLEVBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBRSxxQkFBVSxDQUFDLGFBQWEsQ0FBRSxDQUFFO2lCQUNoRixNQUFNLENBQUUsQ0FBRSxJQUFJLEVBQTBCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFFLENBQUM7WUFFdEQsZ0JBQU0sQ0FBQyxLQUFLLENBQUUsYUFBYSxrQkFBa0IsQ0FBQyxNQUFNLDZCQUE2QixDQUFFLENBQUM7WUFFcEYsTUFBTSxtQkFBbUIsR0FBRyxrQkFBa0I7aUJBQzVDLE1BQU0sQ0FBRSxDQUFFLFdBQW1CLEVBQUUsSUFBbUIsRUFBRyxFQUFFO2dCQUN2RCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUUsQ0FBQztZQUM1RCxDQUFDLEVBQUUsU0FBUyxDQUFFLENBQUM7WUFFaEIsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFHO2dCQUNuQyxnQkFBTSxDQUFDLEtBQUssQ0FBRSxxQ0FBcUMsU0FBUywyREFBMkQsbUJBQW1CLFFBQVEsQ0FBRSxDQUFDO2FBQ3JKO1lBRUQscUJBQXFCLENBQUMsR0FBRyxDQUFFLGFBQWEsRUFBRSxtQkFBbUIsQ0FBRSxDQUFDO1FBQ2pFLENBQUMsQ0FBRSxDQUFDO0lBQ0wsQ0FBQyxDQUFFLENBQUM7SUFFSixPQUFPLHFCQUFxQixDQUFDO0FBQzlCLENBQUM7QUFHRDs7Ozs7Ozs7R0FRRztBQUNILFNBQVMsMkJBQTJCLENBQUUsV0FBeUI7SUFDOUQsZ0JBQU0sQ0FBQyxPQUFPLENBQUUsMkNBQTJDLENBQUUsQ0FBQztJQUM5RCxNQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUE0QixDQUFDO0lBRWhFLFdBQVcsQ0FBQyxPQUFPLENBQUUsQ0FBRSxVQUFzQixFQUFHLEVBQUU7UUFDakQsZ0JBQU0sQ0FBQyxPQUFPLENBQUUsa0RBQWtELFVBQVUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFFLENBQUM7UUFDL0YsTUFBTSxHQUFHLEdBQUcsc0JBQXNCLENBQUUsVUFBVSxDQUFFLENBQUM7UUFFakQsR0FBRyxDQUFDLE9BQU8sQ0FBRSxDQUFFLEVBQW9CLEVBQUcsRUFBRTtZQUN2QyxnQkFBTSxDQUFDLE9BQU8sQ0FBRSwyQ0FBMkMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUUsQ0FBQztZQUM3RSxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDcEMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUVsQyxNQUFNLGVBQWUsR0FBRyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUVuRCxNQUFNLGVBQWUsR0FBRyxlQUFlO2lCQUNyQyxHQUFHLENBQUUsQ0FBRSxJQUFVLEVBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBRSxxQkFBVSxDQUFDLGNBQWMsQ0FBRSxDQUFFO2lCQUNqRixNQUFNLENBQUUsQ0FBRSxJQUFJLEVBQTJCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFFLENBQUM7WUFFdkQsZ0JBQU0sQ0FBQyxLQUFLLENBQUUsYUFBYSxlQUFlLENBQUMsTUFBTSw2QkFBNkIsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUUsQ0FBQztZQUVoRyxNQUFNLG1CQUFtQixHQUFHLGVBQWU7aUJBQ3pDLE1BQU0sQ0FBRSxDQUFFLFdBQW1CLEVBQUUsSUFBb0IsRUFBRyxFQUFFO2dCQUN4RCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUUsQ0FBQztZQUM1RCxDQUFDLEVBQUUsU0FBUyxDQUFFLENBQUM7WUFFaEIsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRztnQkFDaEMsZ0JBQU0sQ0FBQyxLQUFLLENBQUUsa0NBQWtDLFNBQVMsK0RBQStELG1CQUFtQixRQUFRLENBQUUsQ0FBQzthQUN0SjtZQUVELG1CQUFtQixDQUFDLEdBQUcsQ0FBRSxFQUFFLEVBQUUsbUJBQW1CLENBQUUsQ0FBQztRQUNwRCxDQUFDLENBQUUsQ0FBQztJQUNMLENBQUMsQ0FBRSxDQUFDO0lBRUosT0FBTyxtQkFBbUIsQ0FBQztBQUM1QixDQUFDO0FBR0Q7OztHQUdHO0FBQ0gsU0FBUyxzQkFBc0IsQ0FDOUIsVUFBc0I7SUFFdEIsT0FBUyxFQUEwQixDQUFDLE1BQU0sQ0FDekMsVUFBVSxDQUFDLG9CQUFvQixDQUFFLHFCQUFVLENBQUMsbUJBQW1CLENBQUUsRUFDakUsVUFBVSxDQUFDLG9CQUFvQixDQUFFLHFCQUFVLENBQUMsaUJBQWlCLENBQUUsQ0FDL0QsQ0FBQztBQUNILENBQUM7QUFJRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUNILFNBQVMsWUFBWSxDQUFFLFVBQWdEO0lBQ3RFLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUU5QixLQUFLLE1BQU0sRUFBRSxJQUFJLEdBQUcsRUFBRztRQUN0QixNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFcEMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUNsQyxNQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUUsRUFBRSxDQUFHLENBQUM7UUFFbEQsOERBQThEO1FBQzlELHlFQUF5RTtRQUN6RSxLQUFLLElBQUksQ0FBQyxHQUFHLG1CQUFtQixFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUc7WUFDdEQsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDO1lBRTVCLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUc7Z0JBQ3pELEtBQUssQ0FBQyxtQkFBbUIsQ0FBRSxJQUFJLENBQUUsQ0FBQzthQUNsQztTQUNEO0tBQ0Q7QUFDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJvamVjdCwgQ2FsbEV4cHJlc3Npb24sIENsYXNzRGVjbGFyYXRpb24sIENvbnN0cnVjdG9yRGVjbGFyYXRpb24sIEZ1bmN0aW9uRGVjbGFyYXRpb24sIE1ldGhvZERlY2xhcmF0aW9uLCBOZXdFeHByZXNzaW9uLCBOb2RlLCBTb3VyY2VGaWxlLCBTeW50YXhLaW5kIH0gZnJvbSBcInRzLW1vcnBoXCI7XG5pbXBvcnQgbG9nZ2VyIGZyb20gXCIuLi9sb2dnZXIvbG9nZ2VyXCI7XG5cbnR5cGUgTmFtZWFibGVGdW5jdGlvbiA9IEZ1bmN0aW9uRGVjbGFyYXRpb24gfCBNZXRob2REZWNsYXJhdGlvbjtcbnR5cGUgRnVuY3Rpb25UcmFuc2Zvcm1UYXJnZXQgPSBOYW1lYWJsZUZ1bmN0aW9uIHwgQ29uc3RydWN0b3JEZWNsYXJhdGlvbjtcblxuLyoqXG4gKiBBZGRzIHRoZSBxdWVzdGlvbiB0b2tlbiB0byBmdW5jdGlvbi9tZXRob2QvY29uc3RydWN0b3IgcGFyYW1ldGVycyB0aGF0IGFyZVxuICogZGVlbWVkIHRvIGJlIG9wdGlvbmFsIGJhc2VkIG9uIHRoZSBjYWxscyB0byB0aGF0IGZ1bmN0aW9uL21ldGhvZC9jb25zdHJ1Y3RvclxuICogaW4gdGhlIGNvZGViYXNlLlxuICpcbiAqIEZvciBleGFtcGxlLCBpZiB3ZSBoYXZlOlxuICpcbiAqICAgICBmdW5jdGlvbiBteUZuKCBhcmcxLCBhcmcyLCBhcmczICkge1xuICogICAgICAgICAvLyAuLi5cbiAqICAgICB9XG4gKlxuICogICAgIG15Rm4oIDEsIDIsIDMgKTsgIC8vIGFsbCAzIGFyZ3MgcHJvdmlkZWRcbiAqICAgICBteUZuKCAxLCAyICk7ICAgICAvLyA8LS0gYSBjYWxsIHNpdGUgb25seSBwcm92aWRlcyB0d28gYXJndW1lbnRzXG4gKlxuICogVGhlbiB0aGUgcmVzdWx0aW5nIFR5cGVTY3JpcHQgZnVuY3Rpb24gd2lsbCBiZTpcbiAqXG4gKiAgICAgZnVuY3Rpb24gbXlGbiggYXJnMSwgYXJnMiwgYXJnMz8gKSB7ICAgLy8gPC0tIGFyZzMgbWFya2VkIGFzIG9wdGlvbmFsXG4gKiAgICAgICAgIC8vIC4uLlxuICogICAgIH1cbiAqXG4gKiBOb3RlOiBKdXN0IGNhbGxpbmcgdGhlIGxhbmd1YWdlIHNlcnZpY2UgdG8gbG9vayB1cCByZWZlcmVuY2VzIHRha2VzIGEgbG90IG9mXG4gKiB0aW1lLiBNaWdodCBoYXZlIHRvIG9wdGltaXplIHRoaXMgc29tZWhvdyBpbiB0aGUgZnV0dXJlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkT3B0aW9uYWxzVG9GdW5jdGlvblBhcmFtcyggdHNBc3RQcm9qZWN0OiBQcm9qZWN0ICk6IFByb2plY3Qge1xuXHRsb2dnZXIudmVyYm9zZSggJ0JlZ2lubmluZyByb3V0aW5lIHRvIG1hcmsgZnVuY3Rpb24gcGFyYW1ldGVycyBhcyBvcHRpb25hbCB3aGVuIGNhbGxzIGV4aXN0IHRoYXQgc3VwcGx5IGZld2VyIGFyZ3MgdGhhbiBwYXJhbWV0ZXJzLi4uJyApO1xuXHRjb25zdCBzb3VyY2VGaWxlcyA9IHRzQXN0UHJvamVjdC5nZXRTb3VyY2VGaWxlcygpO1xuXG5cdGxvZ2dlci52ZXJib3NlKCAnUGFyc2luZyBmdW5jdGlvbi9tZXRob2QvY29uc3RydWN0b3IgY2FsbHMgZnJvbSBjb2RlYmFzZS4nICk7XG5cdGNvbnN0IGNvbnN0cnVjdG9yTWluQXJnc01hcCA9IHBhcnNlQ2xhc3NDb25zdHJ1Y3RvckNhbGxzKCBzb3VyY2VGaWxlcyApO1xuXHRjb25zdCBmdW5jdGlvbnNNaW5BcmdzTWFwID0gcGFyc2VGdW5jdGlvbkFuZE1ldGhvZENhbGxzKCBzb3VyY2VGaWxlcyApO1xuXG5cdGxvZ2dlci52ZXJib3NlKCAnTWFya2luZyBwYXJhbWV0ZXJzIGFzIG9wdGlvbmFsJyApO1xuXHRhZGRPcHRpb25hbHMoIGNvbnN0cnVjdG9yTWluQXJnc01hcCApO1xuXHRhZGRPcHRpb25hbHMoIGZ1bmN0aW9uc01pbkFyZ3NNYXAgKTtcblxuXHRyZXR1cm4gdHNBc3RQcm9qZWN0O1xufVxuXG5cbi8qKlxuICogRmluZHMgdGhlIGNhbGwgc2l0ZXMgb2YgZWFjaCBDbGFzc0RlY2xhcmF0aW9uJ3MgY29uc3RydWN0b3IgaW4gb3JkZXIgdG9cbiAqIGRldGVybWluZSBpZiBhbnkgb2YgaXRzIHBhcmFtZXRlcnMgc2hvdWxkIGJlIG1hcmtlZCBhcyBvcHRpb25hbC5cbiAqXG4gKiBSZXR1cm5zIGEgTWFwIGtleWVkIGJ5IENsYXNzRGVjbGFyYXRpb24gd2hpY2ggY29udGFpbnMgdGhlIG1pbmltdW0gbnVtYmVyIG9mXG4gKiBhcmd1bWVudHMgcGFzc2VkIHRvIHRoYXQgY2xhc3MncyBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBBY3R1YWxseSBtYXJraW5nIHRoZSBwYXJhbWV0ZXJzIGFzIG9wdGlvbmFsIGlzIGRvbmUgaW4gYSBzZXBhcmF0ZSBwaGFzZS5cbiAqL1xuZnVuY3Rpb24gcGFyc2VDbGFzc0NvbnN0cnVjdG9yQ2FsbHMoIHNvdXJjZUZpbGVzOiBTb3VyY2VGaWxlW10gKTogTWFwPENvbnN0cnVjdG9yRGVjbGFyYXRpb24sIG51bWJlcj4ge1xuXHRsb2dnZXIudmVyYm9zZSggJ0ZpbmRpbmcgYWxsIGNhbGxzIHRvIGNsYXNzIGNvbnN0cnVjdG9ycy4uLicgKTtcblx0Y29uc3QgY29uc3RydWN0b3JNaW5BcmdzTWFwID0gbmV3IE1hcDxDb25zdHJ1Y3RvckRlY2xhcmF0aW9uLCBudW1iZXI+KCk7XG5cblx0c291cmNlRmlsZXMuZm9yRWFjaCggKCBzb3VyY2VGaWxlOiBTb3VyY2VGaWxlICkgPT4ge1xuXHRcdGxvZ2dlci52ZXJib3NlKCBgICBQcm9jZXNzaW5nIGNsYXNzZXMgaW4gc291cmNlIGZpbGU6ICR7c291cmNlRmlsZS5nZXRGaWxlUGF0aCgpfWAgKTtcblx0XHRjb25zdCBjbGFzc2VzID0gc291cmNlRmlsZS5nZXREZXNjZW5kYW50c09mS2luZCggU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uICk7XG5cblx0XHRjbGFzc2VzLmZvckVhY2goICggY2xhc3NEZWNsYXJhdGlvbjogQ2xhc3NEZWNsYXJhdGlvbiApID0+IHtcblx0XHRcdGNvbnN0IGNvbnN0cnVjdG9yRm5zID0gY2xhc3NEZWNsYXJhdGlvbi5nZXRDb25zdHJ1Y3RvcnMoKSB8fCBbXTtcblx0XHRcdGNvbnN0IGNvbnN0cnVjdG9yRm4gPSBjb25zdHJ1Y3RvckZucy5sZW5ndGggPiAwID8gY29uc3RydWN0b3JGbnNbIDAgXSA6IHVuZGVmaW5lZDsgIC8vIG9ubHkgZ3JhYiB0aGUgZmlyc3Qgc2luY2Ugd2UncmUgY29udmVydGluZyBKYXZhU2NyaXB0XG5cblx0XHRcdC8vIElmIHRoZXJlIGlzIG5vIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGlzIGNsYXNzLCB0aGVuIG5vdGhpbmcgdG8gZG9cblx0XHRcdGlmKCAhY29uc3RydWN0b3JGbiApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsb2dnZXIudmVyYm9zZSggYCAgICBMb29raW5nIGZvciBjYWxscyB0byB0aGUgY29uc3RydWN0b3Igb2YgY2xhc3M6ICcke2NsYXNzRGVjbGFyYXRpb24uZ2V0TmFtZSgpfSdgICk7XG5cblx0XHRcdGNvbnN0IGNvbnN0cnVjdG9yRm5QYXJhbXMgPSBjb25zdHJ1Y3RvckZuLmdldFBhcmFtZXRlcnMoKTtcblx0XHRcdGNvbnN0IG51bVBhcmFtcyA9IGNvbnN0cnVjdG9yRm5QYXJhbXMubGVuZ3RoO1xuXG5cdFx0XHRjb25zdCByZWZlcmVuY2VkTm9kZXMgPSBjbGFzc0RlY2xhcmF0aW9uLmZpbmRSZWZlcmVuY2VzQXNOb2RlcygpO1xuXG5cdFx0XHRjb25zdCBjYWxsc1RvQ29uc3RydWN0b3IgPSByZWZlcmVuY2VkTm9kZXNcblx0XHRcdFx0Lm1hcCggKCBub2RlOiBOb2RlICkgPT4gbm9kZS5nZXRGaXJzdEFuY2VzdG9yQnlLaW5kKCBTeW50YXhLaW5kLk5ld0V4cHJlc3Npb24gKSApXG5cdFx0XHRcdC5maWx0ZXIoICggbm9kZSApOiBub2RlIGlzIE5ld0V4cHJlc3Npb24gPT4gISFub2RlICk7XG5cblx0XHRcdGxvZ2dlci5kZWJ1ZyggYCAgICBGb3VuZCAke2NhbGxzVG9Db25zdHJ1Y3Rvci5sZW5ndGh9IGNhbGwocykgdG8gdGhlIGNvbnN0cnVjdG9yYCApO1xuXG5cdFx0XHRjb25zdCBtaW5OdW1iZXJPZkNhbGxBcmdzID0gY2FsbHNUb0NvbnN0cnVjdG9yXG5cdFx0XHRcdC5yZWR1Y2UoICggbWluQ2FsbEFyZ3M6IG51bWJlciwgY2FsbDogTmV3RXhwcmVzc2lvbiApID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gTWF0aC5taW4oIG1pbkNhbGxBcmdzLCBjYWxsLmdldEFyZ3VtZW50cygpLmxlbmd0aCApO1xuXHRcdFx0XHR9LCBudW1QYXJhbXMgKTtcblxuXHRcdFx0aWYoIGNhbGxzVG9Db25zdHJ1Y3Rvci5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsb2dnZXIuZGVidWcoIGAgICAgQ29uc3RydWN0b3IgY3VycmVudGx5IGV4cGVjdHMgJHtudW1QYXJhbXN9IHBhcmFtcy4gQ2FsbChzKSB0byB0aGUgY29uc3RydWN0b3Igc3VwcGx5IGEgbWluaW11bSBvZiAke21pbk51bWJlck9mQ2FsbEFyZ3N9IGFyZ3MuYCApO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdHJ1Y3Rvck1pbkFyZ3NNYXAuc2V0KCBjb25zdHJ1Y3RvckZuLCBtaW5OdW1iZXJPZkNhbGxBcmdzICk7XG5cdFx0fSApO1xuXHR9ICk7XG5cblx0cmV0dXJuIGNvbnN0cnVjdG9yTWluQXJnc01hcDtcbn1cblxuXG4vKipcbiAqIEZpbmRzIHRoZSBjYWxsIHNpdGVzIG9mIGVhY2ggRnVuY3Rpb25EZWNsYXJhdGlvbiBvciBNZXRob2REZWNsYXJhdGlvbiBpblxuICogb3JkZXIgdG8gZGV0ZXJtaW5lIGlmIGFueSBvZiBpdHMgcGFyYW1ldGVycyBzaG91bGQgYmUgbWFya2VkIGFzIG9wdGlvbmFsLlxuICpcbiAqIFJldHVybnMgYSBNYXAga2V5ZWQgYnkgRnVuY3Rpb25EZWNsYXJhdGlvbiBvciBNZXRob2REZWNsYXJhdGlvbiB3aGljaCBjb250YWluc1xuICogdGhlIG1pbmltdW0gbnVtYmVyIG9mIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhhdCBmdW5jdGlvbi9tZXRob2QuXG4gKlxuICogQWN0dWFsbHkgbWFya2luZyB0aGUgcGFyYW1ldGVycyBhcyBvcHRpb25hbCBpcyBkb25lIGluIGEgc2VwYXJhdGUgcGhhc2UuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlRnVuY3Rpb25BbmRNZXRob2RDYWxscyggc291cmNlRmlsZXM6IFNvdXJjZUZpbGVbXSApOiBNYXA8TmFtZWFibGVGdW5jdGlvbiwgbnVtYmVyPiB7XG5cdGxvZ2dlci52ZXJib3NlKCAnRmluZGluZyBhbGwgY2FsbHMgdG8gZnVuY3Rpb25zL21ldGhvZHMuLi4nICk7XG5cdGNvbnN0IGZ1bmN0aW9uc01pbkFyZ3NNYXAgPSBuZXcgTWFwPE5hbWVhYmxlRnVuY3Rpb24sIG51bWJlcj4oKTtcblxuXHRzb3VyY2VGaWxlcy5mb3JFYWNoKCAoIHNvdXJjZUZpbGU6IFNvdXJjZUZpbGUgKSA9PiB7XG5cdFx0bG9nZ2VyLnZlcmJvc2UoIGAgIFByb2Nlc3NpbmcgZnVuY3Rpb25zL21ldGhvZHMgaW4gc291cmNlIGZpbGU6ICR7c291cmNlRmlsZS5nZXRGaWxlUGF0aCgpfWAgKTtcblx0XHRjb25zdCBmbnMgPSBnZXRGdW5jdGlvbnNBbmRNZXRob2RzKCBzb3VyY2VGaWxlICk7XG5cblx0XHRmbnMuZm9yRWFjaCggKCBmbjogTmFtZWFibGVGdW5jdGlvbiApID0+IHtcblx0XHRcdGxvZ2dlci52ZXJib3NlKCBgICAgIExvb2tpbmcgZm9yIGNhbGxzIHRvIHRoZSBmdW5jdGlvbjogJyR7Zm4uZ2V0TmFtZSgpfSdgICk7XG5cdFx0XHRjb25zdCBmblBhcmFtcyA9IGZuLmdldFBhcmFtZXRlcnMoKTtcblx0XHRcdGNvbnN0IG51bVBhcmFtcyA9IGZuUGFyYW1zLmxlbmd0aDtcblxuXHRcdFx0Y29uc3QgcmVmZXJlbmNlZE5vZGVzID0gZm4uZmluZFJlZmVyZW5jZXNBc05vZGVzKCk7XG5cblx0XHRcdGNvbnN0IGNhbGxzVG9GdW5jdGlvbiA9IHJlZmVyZW5jZWROb2Rlc1xuXHRcdFx0XHQubWFwKCAoIG5vZGU6IE5vZGUgKSA9PiBub2RlLmdldEZpcnN0QW5jZXN0b3JCeUtpbmQoIFN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb24gKSApXG5cdFx0XHRcdC5maWx0ZXIoICggbm9kZSApOiBub2RlIGlzIENhbGxFeHByZXNzaW9uID0+ICEhbm9kZSApO1xuXG5cdFx0XHRsb2dnZXIuZGVidWcoIGAgICAgRm91bmQgJHtjYWxsc1RvRnVuY3Rpb24ubGVuZ3RofSBjYWxsKHMpIHRvIHRoZSBmdW5jdGlvbiAnJHtmbi5nZXROYW1lKCl9J2AgKTtcblxuXHRcdFx0Y29uc3QgbWluTnVtYmVyT2ZDYWxsQXJncyA9IGNhbGxzVG9GdW5jdGlvblxuXHRcdFx0XHQucmVkdWNlKCAoIG1pbkNhbGxBcmdzOiBudW1iZXIsIGNhbGw6IENhbGxFeHByZXNzaW9uICkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBNYXRoLm1pbiggbWluQ2FsbEFyZ3MsIGNhbGwuZ2V0QXJndW1lbnRzKCkubGVuZ3RoICk7XG5cdFx0XHRcdH0sIG51bVBhcmFtcyApO1xuXG5cdFx0XHRpZiggY2FsbHNUb0Z1bmN0aW9uLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRcdGxvZ2dlci5kZWJ1ZyggYCAgICBGdW5jdGlvbiBjdXJyZW50bHkgZXhwZWN0cyAke251bVBhcmFtc30gcGFyYW1zLiBDYWxsKHMpIHRvIHRoZSBmdW5jdGlvbi9tZXRob2Qgc3VwcGx5IGEgbWluaW11bSBvZiAke21pbk51bWJlck9mQ2FsbEFyZ3N9IGFyZ3MuYCApO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbnNNaW5BcmdzTWFwLnNldCggZm4sIG1pbk51bWJlck9mQ2FsbEFyZ3MgKTtcblx0XHR9ICk7XG5cdH0gKTtcblxuXHRyZXR1cm4gZnVuY3Rpb25zTWluQXJnc01hcDtcbn1cblxuXG4vKipcbiAqIFJldHJpZXZlcyBhbGwgRnVuY3Rpb25EZWNsYXJhdGlvbnMgYW5kIE1ldGhvZERlY2xhcmF0aW9ucyBmcm9tIHRoZSBnaXZlblxuICogc291cmNlIGZpbGUuXG4gKi9cbmZ1bmN0aW9uIGdldEZ1bmN0aW9uc0FuZE1ldGhvZHMoXG5cdHNvdXJjZUZpbGU6IFNvdXJjZUZpbGVcbik6IE5hbWVhYmxlRnVuY3Rpb25bXSB7XG5cdHJldHVybiAoIFtdIGFzIE5hbWVhYmxlRnVuY3Rpb25bXSApLmNvbmNhdChcblx0XHRzb3VyY2VGaWxlLmdldERlc2NlbmRhbnRzT2ZLaW5kKCBTeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb24gKSxcblx0XHRzb3VyY2VGaWxlLmdldERlc2NlbmRhbnRzT2ZLaW5kKCBTeW50YXhLaW5kLk1ldGhvZERlY2xhcmF0aW9uIClcblx0KTtcbn1cblxuXG5cbi8qKlxuICogTWFya3MgcGFyYW1ldGVycyBvZiBjbGFzcyBjb25zdHJ1Y3RvcnMgLyBtZXRob2RzIC8gZnVuY3Rpb25zIGFzIG9wdGlvbmFsXG4gKiBiYXNlZCBvbiB0aGUgbWluaW11bSBudW1iZXIgb2YgYXJndW1lbnRzIHBhc3NlZCBpbiBhdCBpdHMgY2FsbCBzaXRlcy5cbiAqXG4gKiBFeDpcbiAqXG4gKiAgICAgY2xhc3MgU29tZUNsYXNzIHtcbiAqICAgICAgICAgY29uc3RydWN0b3IoIGFyZzEsIGFyZzIgKSB7fVxuICogICAgIH1cbiAqICAgICBuZXcgU29tZUNsYXNzKCAxICk7ICAvLyBubyBhcmcyXG4gKlxuICogICAgIGZ1bmN0aW9uIG15Rm4oIGFyZzEsIGFyZzIgKSB7fVxuICogICAgIG15Rm4oKTsgIC8vIG5vIGFyZ3NcbiAqXG4gKlxuICogT3V0cHV0IGNsYXNzIGFuZCBmdW5jdGlvbjpcbiAqXG4gKiAgICAgY2xhc3MgU29tZUNsYXNzIHtcbiAqICAgICAgICAgY29uc3RydWN0b3IoIGFyZzEsIGFyZzI/ICkge30gIC8vIDwtLSBhcmcyIG1hcmtlZCBhcyBvcHRpb25hbFxuICogICAgIH1cbiAqXG4gKiAgICAgZnVuY3Rpb24gbXlGbiggYXJnMT8sIGFyZzI/ICkge30gICAvLyA8LS0gYXJnMSBhbmQgYXJnMiBtYXJrZWQgYXMgb3B0aW9uYWxcbiAqL1xuZnVuY3Rpb24gYWRkT3B0aW9uYWxzKCBtaW5BcmdzTWFwOiBNYXA8RnVuY3Rpb25UcmFuc2Zvcm1UYXJnZXQsIG51bWJlcj4gKSB7XG5cdGNvbnN0IGZucyA9IG1pbkFyZ3NNYXAua2V5cygpO1xuXG5cdGZvciggY29uc3QgZm4gb2YgZm5zICkge1xuXHRcdGNvbnN0IGZuUGFyYW1zID0gZm4uZ2V0UGFyYW1ldGVycygpO1xuXG5cdFx0Y29uc3QgbnVtUGFyYW1zID0gZm5QYXJhbXMubGVuZ3RoO1xuXHRcdGNvbnN0IG1pbk51bWJlck9mQ2FsbEFyZ3MgPSBtaW5BcmdzTWFwLmdldCggZm4gKSE7XG5cblx0XHQvLyBNYXJrIGFsbCBwYXJhbWV0ZXJzIGdyZWF0ZXIgdGhhbiB0aGUgbWluTnVtYmVyT2ZDYWxsQXJncyBhc1xuXHRcdC8vIG9wdGlvbmFsIChpZiBpdCdzIG5vdCBhIHJlc3QgcGFyYW1ldGVyIG9yIGFscmVhZHkgaGFzIGEgZGVmYXVsdCB2YWx1ZSlcblx0XHRmb3IoIGxldCBpID0gbWluTnVtYmVyT2ZDYWxsQXJnczsgaSA8IG51bVBhcmFtczsgaSsrICkge1xuXHRcdFx0Y29uc3QgcGFyYW0gPSBmblBhcmFtc1sgaSBdO1xuXG5cdFx0XHRpZiggIXBhcmFtLmlzUmVzdFBhcmFtZXRlcigpICYmICFwYXJhbS5oYXNJbml0aWFsaXplcigpICkge1xuXHRcdFx0XHRwYXJhbS5zZXRIYXNRdWVzdGlvblRva2VuKCB0cnVlICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59Il19