"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_simple_ast_1 = require("ts-simple-ast");
const is_prop_or_elem_access_with_obj_1 = require("../util/is-prop-or-elem-access-with-obj");
const is_this_referencing_var_1 = require("../util/is-this-referencing-var");
const TraceError = require('trace-error');
/**
 * Parses the classes out of each .js file in the SourceFilesCollection, and
 * transforms any function expressions found into arrow functions.
 *
 * Also removes any `var that = this;` statements, and replaces usages of the
 * variable `that` (or whichever identifier is used for it) back to `this`.
 */
function convertToArrowFunctions(tsAstProject) {
    const sourceFiles = tsAstProject.getSourceFiles();
    sourceFiles.forEach((sourceFile) => {
        const classes = sourceFile.getClasses();
        classes.forEach((classDeclaration) => {
            // Mutates the ClassDeclaration - no good way to make this an
            // immutable transform
            replaceFunctionExpressions(classDeclaration);
            replaceSelfReferencingVars(classDeclaration);
        });
    });
    return tsAstProject;
}
exports.convertToArrowFunctions = convertToArrowFunctions;
/**
 * Replaces old-style function expressions with arrow functions.
 *
 * Ex input:
 *
 *    var something = function( a, b ) { ... }
 *
 * Transformed to:
 *
 *    var something = ( a, b ) => { ... }
 */
function replaceFunctionExpressions(classDeclaration) {
    const className = classDeclaration.getName();
    const functionExpressions = classDeclaration.getDescendantsOfKind(ts_simple_ast_1.SyntaxKind.FunctionExpression);
    const functionExpressionsText = functionExpressions.map(fe => fe.getFullText()); // for debugging, which may be needed after some function expressions have been replaced
    // Need to process the function expressions in reverse order to produce a
    // bottom-up transformation. If we do top down, we can replace a parent
    // function expression before the child function expression, and then we
    // access a node (the child function expression) that has been removed
    functionExpressions.reverse().forEach((functionExpression, i) => {
        try {
            let newText = `(` + paramsToText(functionExpression) + `) => `;
            newText += functionExpression.getBody().getFullText()
                .replace(/^\s*/, ''); // replace any leading spaces from the function body
            functionExpression.replaceWithText(newText);
        }
        catch (error) {
            throw new TraceError(`
				An error occurred while trying to replace a function expression
				with an arrow function. Was processing class ${className}, and
				looking at a function expression with text:
				
				${functionExpressionsText[i]}
			`.trim().replace(/^\t*/gm, ''), error);
        }
    });
}
/**
 * Reads the parameters of a function expression and returns its source text.
 */
function paramsToText(functionExpression) {
    return functionExpression.getParameters()
        .map((param) => param.getFullText())
        .join(',');
}
/**
 * Replaces variables that were needed before arrow functions to maintain the
 * `this` reference in inner functions.
 *
 * Ex:
 *
 *     var that = this;
 *
 *     var myFn = function() {
 *         console.log( that.someProp );
 *     }
 *
 * Replaced with:
 *
 *     var myFn = () => {
 *         console.log( this.someProp );  // note: `that` -> `this`
 *     };
 */
function replaceSelfReferencingVars(classDeclaration) {
    const sourceFile = classDeclaration.getSourceFile(); // for debugging info
    const methods = classDeclaration.getMethods();
    methods.forEach((method) => {
        const methodText = method.getFullText(); // for debugging info
        try {
            doReplaceSelfReferencingVars(method);
        }
        catch (error) {
            throw new TraceError(`
				An error occurred while converting variables which refer to \`this\`
				with the \`this\` keyword itself. 
				
				Was processing file: '${sourceFile.getFilePath()}'.
				Processing the method with text: 
				  ${methodText}.
			`.trim().replace(/^\t*/gm, ''), error);
        }
    });
}
/**
 * Performs the actual replacements for {@link #replaceSelfReferencingVars}.
 */
function doReplaceSelfReferencingVars(node) {
    // find var declarations like `var that = this;` or `var self = this;`
    const thisVarDeclarations = node
        .getDescendantsOfKind(ts_simple_ast_1.SyntaxKind.VariableDeclaration)
        .filter(is_this_referencing_var_1.isThisReferencingVar);
    // Get the array of identifiers assigned to `this`. Ex: [ 'that', 'self' ]
    const thisVarIdentifiers = thisVarDeclarations
        .map((thisVarDec) => thisVarDec.getName());
    // Remove the `var that = this` or `var self = this` variable
    // declarations. Seems to need to be done before the `that->this`
    // conversions in some cases, so putting it before
    thisVarDeclarations.forEach((varDec) => {
        varDec.remove();
    });
    replaceThisVarsWithThisKeyword(node, thisVarIdentifiers);
}
/**
 * Replaces any variables that referenced `this` with the `this` keyword itself.
 */
function replaceThisVarsWithThisKeyword(node, thisVarIdentifiers // ex: [ 'that', 'self', 'me' ]
) {
    thisVarIdentifiers.forEach((thisVarIdentifier) => {
        try {
            doReplaceThisVarWithThisKeyword(node, thisVarIdentifier);
        }
        catch (error) {
            throw new TraceError(`
				An error occurred while converting variables which refer to \`this\`
				(the identifier(s): '${thisVarIdentifiers.join("',")}') with the 
				\`this\` keyword itself. 
				
				Was attempting to replace identifier '${thisVarIdentifier}' with the 'this' keyword.
			`.trim().replace(/^\t*/gm, ''), error);
        }
    });
}
/**
 * Performs the actual replacements for the {@link #replaceThisVarsWithThisKeyword}
 * function.
 */
function doReplaceThisVarWithThisKeyword(node, thisVarIdentifier // ex: 'that' or 'self'
) {
    const nodeText = node.getFullText(); // for debuggig information
    // grab PropertyAccessExpressions like `that.someProp` or `self.someProp`
    const propAccessesOfThisVarIdentifiers = node
        .getDescendants()
        .filter(is_prop_or_elem_access_with_obj_1.propOrElemAccessWithObjFilter(thisVarIdentifier)); // seem to need to do this transformation in a bottom-up manner, or we can run into the error of "Attempted to get information from a node that was removed or forgotten"
    // Change propAccessesOfThisVarIdentifiers to use `this` as their
    // expression (object) instead of `that`/`self`/etc.
    propAccessesOfThisVarIdentifiers.forEach((propAccess) => {
        const propAccessText = propAccess.getText();
        try {
            // Attempt workaround for very long property access expressions.
            // If we just replace the `that.something` part of `that.something.something2.something3.something4`,
            // then ts-simple-ast throws an error. So replacing the entire
            // chained PropertyAccessExpression instead.
            let parentMostPropAccess = propAccess;
            while (parentMostPropAccess.getParentIfKind(ts_simple_ast_1.SyntaxKind.PropertyAccessExpression)) {
                parentMostPropAccess = parentMostPropAccess.getParent();
            }
            const newText = parentMostPropAccess.getText()
                .replace(new RegExp('^' + thisVarIdentifier), 'this');
            parentMostPropAccess.replaceWithText(newText);
            // Old workaround #2: Failed at 4 levels of properties:
            //    that.something1.something2.something3.something4
            // const newText = propAccessText
            // 	.replace( new RegExp( '^' + thisVarIdentifier ), 'this' );
            //
            // console.log( 'new text: ', newText );
            // propAccess.replaceWithText( newText );
            // Old code which threw an error when we had a long PropertyAccessExpression
            // like `that.something1.something2.something3`
            //const identifier = propAccess.getExpression() as Identifier;
            //identifier.replaceWithText( `this` );
        }
        catch (error) {
            throw new TraceError(`
				An error occurred while attempting to convert the expression:
				  ${propAccessText} 
				to replace '${thisVarIdentifier}' with the 'this' keyword.
				
				Was looking at node with text:
				
				${nodeText}
			`.trim().replace(/^\t*/gm, ''), error);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVydC10by1hcnJvdy1mdW5jdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udmVydGVyL2NvbnZlcnQtdG8tYXJyb3ctZnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaURBQXFQO0FBQ3JQLDZGQUF3RjtBQUN4Riw2RUFBdUU7QUFDdkUsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFFLGFBQWEsQ0FBRSxDQUFDO0FBRTVDOzs7Ozs7R0FNRztBQUNILGlDQUF5QyxZQUFxQjtJQUM3RCxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7SUFFbEQsV0FBVyxDQUFDLE9BQU8sQ0FBRSxDQUFFLFVBQXNCLEVBQUcsRUFBRTtRQUNqRCxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFeEMsT0FBTyxDQUFDLE9BQU8sQ0FBRSxDQUFFLGdCQUFrQyxFQUFHLEVBQUU7WUFDekQsNkRBQTZEO1lBQzdELHNCQUFzQjtZQUN0QiwwQkFBMEIsQ0FBRSxnQkFBZ0IsQ0FBRSxDQUFDO1lBQy9DLDBCQUEwQixDQUFFLGdCQUFnQixDQUFFLENBQUM7UUFDaEQsQ0FBQyxDQUFFLENBQUM7SUFDTCxDQUFDLENBQUUsQ0FBQztJQUVKLE9BQU8sWUFBWSxDQUFDO0FBQ3JCLENBQUM7QUFmRCwwREFlQztBQUdEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxvQ0FBcUMsZ0JBQWtDO0lBQ3RFLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdDLE1BQU0sbUJBQW1CLEdBQUcsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUUsMEJBQVUsQ0FBQyxrQkFBa0IsQ0FBRSxDQUFDO0lBQ25HLE1BQU0sdUJBQXVCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFFLENBQUMsQ0FB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LE1BQU0sQ0FBRSxHQUFHLEdBQUcsaUJBQWlCLENBQUUsRUFBRSxNQUFNLENBQUUsQ0FBQztZQUUzRCxvQkFBb0IsQ0FBQyxlQUFlLENBQUUsT0FBTyxDQUFFLENBQUM7WUFFaEQsdURBQXVEO1lBQ3ZELHNEQUFzRDtZQUN0RCxpQ0FBaUM7WUFDakMsOERBQThEO1lBQzlELEVBQUU7WUFDRix3Q0FBd0M7WUFDeEMseUNBQXlDO1lBRXpDLDRFQUE0RTtZQUM1RSwrQ0FBK0M7WUFDL0MsOERBQThEO1lBQzlELHVDQUF1QztTQUV2QztRQUFDLE9BQU8sS0FBSyxFQUFHO1lBQ2hCLE1BQU0sSUFBSSxVQUFVLENBQUU7O1FBRWpCLGNBQWM7a0JBQ0osaUJBQWlCOzs7O01BSTdCLFFBQVE7SUFDVixDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBRSxRQUFRLEVBQUUsRUFBRSxDQUFFLEVBQUUsS0FBSyxDQUFFLENBQUM7U0FDMUM7SUFDRixDQUFDLENBQUUsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvamVjdCwgeyBDbGFzc0RlY2xhcmF0aW9uLCBFbGVtZW50QWNjZXNzRXhwcmVzc2lvbiwgRnVuY3Rpb25FeHByZXNzaW9uLCBJZGVudGlmaWVyLCBNZXRob2REZWNsYXJhdGlvbiwgTm9kZSwgUGFyYW1ldGVyRGVjbGFyYXRpb24sIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiwgU291cmNlRmlsZSwgU3ludGF4S2luZCwgVHlwZUd1YXJkcywgVmFyaWFibGVEZWNsYXJhdGlvbiB9IGZyb20gXCJ0cy1zaW1wbGUtYXN0XCI7XG5pbXBvcnQgeyBwcm9wT3JFbGVtQWNjZXNzV2l0aE9iakZpbHRlciB9IGZyb20gXCIuLi91dGlsL2lzLXByb3Atb3ItZWxlbS1hY2Nlc3Mtd2l0aC1vYmpcIjtcbmltcG9ydCB7IGlzVGhpc1JlZmVyZW5jaW5nVmFyIH0gZnJvbSBcIi4uL3V0aWwvaXMtdGhpcy1yZWZlcmVuY2luZy12YXJcIjtcbmNvbnN0IFRyYWNlRXJyb3IgPSByZXF1aXJlKCAndHJhY2UtZXJyb3InICk7XG5cbi8qKlxuICogUGFyc2VzIHRoZSBjbGFzc2VzIG91dCBvZiBlYWNoIC5qcyBmaWxlIGluIHRoZSBTb3VyY2VGaWxlc0NvbGxlY3Rpb24sIGFuZFxuICogdHJhbnNmb3JtcyBhbnkgZnVuY3Rpb24gZXhwcmVzc2lvbnMgZm91bmQgaW50byBhcnJvdyBmdW5jdGlvbnMuXG4gKlxuICogQWxzbyByZW1vdmVzIGFueSBgdmFyIHRoYXQgPSB0aGlzO2Agc3RhdGVtZW50cywgYW5kIHJlcGxhY2VzIHVzYWdlcyBvZiB0aGVcbiAqIHZhcmlhYmxlIGB0aGF0YCAob3Igd2hpY2hldmVyIGlkZW50aWZpZXIgaXMgdXNlZCBmb3IgaXQpIGJhY2sgdG8gYHRoaXNgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydFRvQXJyb3dGdW5jdGlvbnMoIHRzQXN0UHJvamVjdDogUHJvamVjdCApOiBQcm9qZWN0IHtcblx0Y29uc3Qgc291cmNlRmlsZXMgPSB0c0FzdFByb2plY3QuZ2V0U291cmNlRmlsZXMoKTtcblxuXHRzb3VyY2VGaWxlcy5mb3JFYWNoKCAoIHNvdXJjZUZpbGU6IFNvdXJjZUZpbGUgKSA9PiB7XG5cdFx0Y29uc3QgY2xhc3NlcyA9IHNvdXJjZUZpbGUuZ2V0Q2xhc3NlcygpO1xuXG5cdFx0Y2xhc3Nlcy5mb3JFYWNoKCAoIGNsYXNzRGVjbGFyYXRpb246IENsYXNzRGVjbGFyYXRpb24gKSA9PiB7XG5cdFx0XHQvLyBNdXRhdGVzIHRoZSBDbGFzc0RlY2xhcmF0aW9uIC0gbm8gZ29vZCB3YXkgdG8gbWFrZSB0aGlzIGFuXG5cdFx0XHQvLyBpbW11dGFibGUgdHJhbnNmb3JtXG5cdFx0XHRyZXBsYWNlRnVuY3Rpb25FeHByZXNzaW9ucyggY2xhc3NEZWNsYXJhdGlvbiApO1xuXHRcdFx0cmVwbGFjZVNlbGZSZWZlcmVuY2luZ1ZhcnMoIGNsYXNzRGVjbGFyYXRpb24gKTtcblx0XHR9ICk7XG5cdH0gKTtcblxuXHRyZXR1cm4gdHNBc3RQcm9qZWN0O1xufVxuXG5cbi8qKlxuICogUmVwbGFjZXMgb2xkLXN0eWxlIGZ1bmN0aW9uIGV4cHJlc3Npb25zIHdpdGggYXJyb3cgZnVuY3Rpb25zLlxuICpcbiAqIEV4IGlucHV0OlxuICpcbiAqICAgIHZhciBzb21ldGhpbmcgPSBmdW5jdGlvbiggYSwgYiApIHsgLi4uIH1cbiAqXG4gKiBUcmFuc2Zvcm1lZCB0bzpcbiAqXG4gKiAgICB2YXIgc29tZXRoaW5nID0gKCBhLCBiICkgPT4geyAuLi4gfVxuICovXG5mdW5jdGlvbiByZXBsYWNlRnVuY3Rpb25FeHByZXNzaW9ucyggY2xhc3NEZWNsYXJhdGlvbjogQ2xhc3NEZWNsYXJhdGlvbiApIHtcblx0Y29uc3QgY2xhc3NOYW1lID0gY2xhc3NEZWNsYXJhdGlvbi5nZXROYW1lKCk7XG5cdGNvbnN0IGZ1bmN0aW9uRXhwcmVzc2lvbnMgPSBjbGFzc0RlY2xhcmF0aW9uLmdldERlc2NlbmRhbnRzT2ZLaW5kKCBTeW50YXhLaW5kLkZ1bmN0aW9uRXhwcmVzc2lvbiApO1xuXHRjb25zdCBmdW5jdGlvbkV4cHJlc3Npb25zVGV4dCA9IGZ1bmN0aW9uRXhwcmVzc2lvbnMubWFwKCBmZSA9PiBmZS5nZXRGdWxsVGV4dCgpICk7ICAvLyBmb3IgZGVidWdnaW5nLCB3aGljaCBtYXkgYmUgbmVlZGVkIGFmdGVyIHNvbWUgZnVuY3Rpb24gZXhwcmVzc2lvbnMgaGF2ZSBiZWVuIHJlcGxhY2VkXG5cblx0Ly8gTmVlZCB0byBwcm9jZXNzIHRoZSBmdW5jdGlvbiBleHByZXNzaW9ucyBpbiByZXZlcnNlIG9yZGVyIHRvIHByb2R1Y2UgYVxuXHQvLyBib3R0b20tdXAgdHJhbnNmb3JtYXRpb24uIElmIHdlIGRvIHRvcCBkb3duLCB3ZSBjYW4gcmVwbGFjZSBhIHBhcmVudFxuXHQvLyBmdW5jdGlvbiBleHByZXNzaW9uIGJlZm9yZSB0aGUgY2hpbGQgZnVuY3Rpb24gZXhwcmVzc2lvbiwgYW5kIHRoZW4gd2Vcblx0Ly8gYWNjZXNzIGEgbm9kZSAodGhlIGNoaWxkIGZ1bmN0aW9uIGV4cHJlc3Npb24pIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZFxuXHRmdW5jdGlvbkV4cHJlc3Npb25zLnJldmVyc2UoKS5mb3JFYWNoKCAoIGZ1bmN0aW9uRXhwcmVzc2lvbjogRnVuY3Rpb25FeHByZXNzaW9uLCBpOiBudW1iZXIgKSA9PiB7XG5cdFx0dHJ5IHtcblx0XHRcdGxldCBuZXdUZXh0ID0gYChgICsgcGFyYW1zVG9UZXh0KCBmdW5jdGlvbkV4cHJlc3Npb24gKSArIGApID0+IGA7XG5cdFx0XHRuZXdUZXh0ICs9IGZ1bmN0aW9uRXhwcmVzc2lvbi5nZXRCb2R5KCkuZ2V0RnVsbFRleHQoKVxuXHRcdFx0XHQucmVwbGFjZSggL15cXHMqLywgJycgKTsgIC8vIHJlcGxhY2UgYW55IGxlYWRpbmcgc3BhY2VzIGZyb20gdGhlIGZ1bmN0aW9uIGJvZHlcblxuXHRcdFx0ZnVuY3Rpb25FeHByZXNzaW9uLnJlcGxhY2VXaXRoVGV4dCggbmV3VGV4dCApO1xuXHRcdH0gY2F0Y2goIGVycm9yICkge1xuXHRcdFx0dGhyb3cgbmV3IFRyYWNlRXJyb3IoIGBcblx0XHRcdFx0QW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgdHJ5aW5nIHRvIHJlcGxhY2UgYSBmdW5jdGlvbiBleHByZXNzaW9uXG5cdFx0XHRcdHdpdGggYW4gYXJyb3cgZnVuY3Rpb24uIFdhcyBwcm9jZXNzaW5nIGNsYXNzICR7Y2xhc3NOYW1lfSwgYW5kXG5cdFx0XHRcdGxvb2tpbmcgYXQgYSBmdW5jdGlvbiBleHByZXNzaW9uIHdpdGggdGV4dDpcblx0XHRcdFx0XG5cdFx0XHRcdCR7ZnVuY3Rpb25FeHByZXNzaW9uc1RleHRbIGkgXX1cblx0XHRcdGAudHJpbSgpLnJlcGxhY2UoIC9eXFx0Ki9nbSwgJycgKSwgZXJyb3IgKTtcblx0XHR9XG5cdH0gKTtcbn1cblxuXG4vKipcbiAqIFJlYWRzIHRoZSBwYXJhbWV0ZXJzIG9mIGEgZnVuY3Rpb24gZXhwcmVzc2lvbiBhbmQgcmV0dXJucyBpdHMgc291cmNlIHRleHQuXG4gKi9cbmZ1bmN0aW9uIHBhcmFtc1RvVGV4dCggZnVuY3Rpb25FeHByZXNzaW9uOiBGdW5jdGlvbkV4cHJlc3Npb24gKTogc3RyaW5nIHtcblx0cmV0dXJuIGZ1bmN0aW9uRXhwcmVzc2lvbi5nZXRQYXJhbWV0ZXJzKClcblx0XHQubWFwKCAoIHBhcmFtOiBQYXJhbWV0ZXJEZWNsYXJhdGlvbiApID0+IHBhcmFtLmdldEZ1bGxUZXh0KCkgKVxuXHRcdC5qb2luKCAnLCcgKTtcbn1cblxuXG4vKipcbiAqIFJlcGxhY2VzIHZhcmlhYmxlcyB0aGF0IHdlcmUgbmVlZGVkIGJlZm9yZSBhcnJvdyBmdW5jdGlvbnMgdG8gbWFpbnRhaW4gdGhlXG4gKiBgdGhpc2AgcmVmZXJlbmNlIGluIGlubmVyIGZ1bmN0aW9ucy5cbiAqXG4gKiBFeDpcbiAqXG4gKiAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICpcbiAqICAgICB2YXIgbXlGbiA9IGZ1bmN0aW9uKCkge1xuICogICAgICAgICBjb25zb2xlLmxvZyggdGhhdC5zb21lUHJvcCApO1xuICogICAgIH1cbiAqXG4gKiBSZXBsYWNlZCB3aXRoOlxuICpcbiAqICAgICB2YXIgbXlGbiA9ICgpID0+IHtcbiAqICAgICAgICAgY29uc29sZS5sb2coIHRoaXMuc29tZVByb3AgKTsgIC8vIG5vdGU6IGB0aGF0YCAtPiBgdGhpc2BcbiAqICAgICB9O1xuICovXG5mdW5jdGlvbiByZXBsYWNlU2VsZlJlZmVyZW5jaW5nVmFycyggY2xhc3NEZWNsYXJhdGlvbjogQ2xhc3NEZWNsYXJhdGlvbiApIHtcblx0Y29uc3Qgc291cmNlRmlsZSA9IGNsYXNzRGVjbGFyYXRpb24uZ2V0U291cmNlRmlsZSgpOyAgLy8gZm9yIGRlYnVnZ2luZyBpbmZvXG5cdGNvbnN0IG1ldGhvZHMgPSBjbGFzc0RlY2xhcmF0aW9uLmdldE1ldGhvZHMoKTtcblxuXHRtZXRob2RzLmZvckVhY2goICggbWV0aG9kOiBNZXRob2REZWNsYXJhdGlvbiApID0+IHtcblx0XHRjb25zdCBtZXRob2RUZXh0ID0gbWV0aG9kLmdldEZ1bGxUZXh0KCk7ICAvLyBmb3IgZGVidWdnaW5nIGluZm9cblxuXHRcdHRyeSB7XG5cdFx0XHRkb1JlcGxhY2VTZWxmUmVmZXJlbmNpbmdWYXJzKCBtZXRob2QgKTtcblxuXHRcdH0gY2F0Y2goIGVycm9yICkge1xuXHRcdFx0dGhyb3cgbmV3IFRyYWNlRXJyb3IoIGBcblx0XHRcdFx0QW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgY29udmVydGluZyB2YXJpYWJsZXMgd2hpY2ggcmVmZXIgdG8gXFxgdGhpc1xcYFxuXHRcdFx0XHR3aXRoIHRoZSBcXGB0aGlzXFxgIGtleXdvcmQgaXRzZWxmLiBcblx0XHRcdFx0XG5cdFx0XHRcdFdhcyBwcm9jZXNzaW5nIGZpbGU6ICcke3NvdXJjZUZpbGUuZ2V0RmlsZVBhdGgoKX0nLlxuXHRcdFx0XHRQcm9jZXNzaW5nIHRoZSBtZXRob2Qgd2l0aCB0ZXh0OiBcblx0XHRcdFx0ICAke21ldGhvZFRleHR9LlxuXHRcdFx0YC50cmltKCkucmVwbGFjZSggL15cXHQqL2dtLCAnJyApLCBlcnJvciApO1xuXHRcdH1cblx0fSApO1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIHRoZSBhY3R1YWwgcmVwbGFjZW1lbnRzIGZvciB7QGxpbmsgI3JlcGxhY2VTZWxmUmVmZXJlbmNpbmdWYXJzfS5cbiAqL1xuZnVuY3Rpb24gZG9SZXBsYWNlU2VsZlJlZmVyZW5jaW5nVmFycyggbm9kZTogTm9kZSApIHtcblx0Ly8gZmluZCB2YXIgZGVjbGFyYXRpb25zIGxpa2UgYHZhciB0aGF0ID0gdGhpcztgIG9yIGB2YXIgc2VsZiA9IHRoaXM7YFxuXHRjb25zdCB0aGlzVmFyRGVjbGFyYXRpb25zID0gbm9kZVxuXHRcdC5nZXREZXNjZW5kYW50c09mS2luZCggU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uIClcblx0XHQuZmlsdGVyKCBpc1RoaXNSZWZlcmVuY2luZ1ZhciApO1xuXG5cdC8vIEdldCB0aGUgYXJyYXkgb2YgaWRlbnRpZmllcnMgYXNzaWduZWQgdG8gYHRoaXNgLiBFeDogWyAndGhhdCcsICdzZWxmJyBdXG5cdGNvbnN0IHRoaXNWYXJJZGVudGlmaWVycyA9IHRoaXNWYXJEZWNsYXJhdGlvbnNcblx0XHQubWFwKCAoIHRoaXNWYXJEZWM6IFZhcmlhYmxlRGVjbGFyYXRpb24gKSA9PiB0aGlzVmFyRGVjLmdldE5hbWUoKSApO1xuXG5cblx0Ly8gUmVtb3ZlIHRoZSBgdmFyIHRoYXQgPSB0aGlzYCBvciBgdmFyIHNlbGYgPSB0aGlzYCB2YXJpYWJsZVxuXHQvLyBkZWNsYXJhdGlvbnMuIFNlZW1zIHRvIG5lZWQgdG8gYmUgZG9uZSBiZWZvcmUgdGhlIGB0aGF0LT50aGlzYFxuXHQvLyBjb252ZXJzaW9ucyBpbiBzb21lIGNhc2VzLCBzbyBwdXR0aW5nIGl0IGJlZm9yZVxuXHR0aGlzVmFyRGVjbGFyYXRpb25zLmZvckVhY2goICggdmFyRGVjOiBWYXJpYWJsZURlY2xhcmF0aW9uICkgPT4ge1xuXHRcdHZhckRlYy5yZW1vdmUoKTtcblx0fSApO1xuXG5cdHJlcGxhY2VUaGlzVmFyc1dpdGhUaGlzS2V5d29yZCggbm9kZSwgdGhpc1ZhcklkZW50aWZpZXJzICk7XG59XG5cblxuLyoqXG4gKiBSZXBsYWNlcyBhbnkgdmFyaWFibGVzIHRoYXQgcmVmZXJlbmNlZCBgdGhpc2Agd2l0aCB0aGUgYHRoaXNgIGtleXdvcmQgaXRzZWxmLlxuICovXG5mdW5jdGlvbiByZXBsYWNlVGhpc1ZhcnNXaXRoVGhpc0tleXdvcmQoXG5cdG5vZGU6IE5vZGUsXG5cdHRoaXNWYXJJZGVudGlmaWVyczogc3RyaW5nW10gIC8vIGV4OiBbICd0aGF0JywgJ3NlbGYnLCAnbWUnIF1cbikge1xuXHR0aGlzVmFySWRlbnRpZmllcnMuZm9yRWFjaCggKCB0aGlzVmFySWRlbnRpZmllcjogc3RyaW5nICkgPT4ge1xuXHRcdHRyeSB7XG5cdFx0XHRkb1JlcGxhY2VUaGlzVmFyV2l0aFRoaXNLZXl3b3JkKCBub2RlLCB0aGlzVmFySWRlbnRpZmllciApO1xuXG5cdFx0fSBjYXRjaCggZXJyb3IgKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHJhY2VFcnJvciggYFxuXHRcdFx0XHRBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBjb252ZXJ0aW5nIHZhcmlhYmxlcyB3aGljaCByZWZlciB0byBcXGB0aGlzXFxgXG5cdFx0XHRcdCh0aGUgaWRlbnRpZmllcihzKTogJyR7dGhpc1ZhcklkZW50aWZpZXJzLmpvaW4oXCInLFwiKX0nKSB3aXRoIHRoZSBcblx0XHRcdFx0XFxgdGhpc1xcYCBrZXl3b3JkIGl0c2VsZi4gXG5cdFx0XHRcdFxuXHRcdFx0XHRXYXMgYXR0ZW1wdGluZyB0byByZXBsYWNlIGlkZW50aWZpZXIgJyR7dGhpc1ZhcklkZW50aWZpZXJ9JyB3aXRoIHRoZSAndGhpcycga2V5d29yZC5cblx0XHRcdGAudHJpbSgpLnJlcGxhY2UoIC9eXFx0Ki9nbSwgJycgKSwgZXJyb3IgKTtcblx0XHR9XG5cdH0gKTtcbn1cblxuXG4vKipcbiAqIFBlcmZvcm1zIHRoZSBhY3R1YWwgcmVwbGFjZW1lbnRzIGZvciB0aGUge0BsaW5rICNyZXBsYWNlVGhpc1ZhcnNXaXRoVGhpc0tleXdvcmR9XG4gKiBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gZG9SZXBsYWNlVGhpc1ZhcldpdGhUaGlzS2V5d29yZChcblx0bm9kZTogTm9kZSxcblx0dGhpc1ZhcklkZW50aWZpZXI6IHN0cmluZyAgLy8gZXg6ICd0aGF0JyBvciAnc2VsZidcbikge1xuXHRjb25zdCBub2RlVGV4dCA9IG5vZGUuZ2V0RnVsbFRleHQoKTsgIC8vIGZvciBkZWJ1Z2dpZyBpbmZvcm1hdGlvblxuXG5cdC8vIGdyYWIgUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9ucyBsaWtlIGB0aGF0LnNvbWVQcm9wYCBvciBgc2VsZi5zb21lUHJvcGBcblx0Y29uc3QgcHJvcEFjY2Vzc2VzT2ZUaGlzVmFySWRlbnRpZmllcnM6IChQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gfCBFbGVtZW50QWNjZXNzRXhwcmVzc2lvbilbXSA9IG5vZGVcblx0XHQuZ2V0RGVzY2VuZGFudHMoKVxuXHRcdC5maWx0ZXIoIHByb3BPckVsZW1BY2Nlc3NXaXRoT2JqRmlsdGVyKCB0aGlzVmFySWRlbnRpZmllciApICk7ICAvLyBzZWVtIHRvIG5lZWQgdG8gZG8gdGhpcyB0cmFuc2Zvcm1hdGlvbiBpbiBhIGJvdHRvbS11cCBtYW5uZXIsIG9yIHdlIGNhbiBydW4gaW50byB0aGUgZXJyb3Igb2YgXCJBdHRlbXB0ZWQgdG8gZ2V0IGluZm9ybWF0aW9uIGZyb20gYSBub2RlIHRoYXQgd2FzIHJlbW92ZWQgb3IgZm9yZ290dGVuXCJcblxuXHQvLyBDaGFuZ2UgcHJvcEFjY2Vzc2VzT2ZUaGlzVmFySWRlbnRpZmllcnMgdG8gdXNlIGB0aGlzYCBhcyB0aGVpclxuXHQvLyBleHByZXNzaW9uIChvYmplY3QpIGluc3RlYWQgb2YgYHRoYXRgL2BzZWxmYC9ldGMuXG5cdHByb3BBY2Nlc3Nlc09mVGhpc1ZhcklkZW50aWZpZXJzLmZvckVhY2goICggcHJvcEFjY2VzczogUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uIHwgRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24gKSA9PiB7XG5cdFx0Y29uc3QgcHJvcEFjY2Vzc1RleHQgPSBwcm9wQWNjZXNzLmdldFRleHQoKTtcblxuXHRcdHRyeSB7XG5cdFx0XHQvLyBBdHRlbXB0IHdvcmthcm91bmQgZm9yIHZlcnkgbG9uZyBwcm9wZXJ0eSBhY2Nlc3MgZXhwcmVzc2lvbnMuXG5cdFx0XHQvLyBJZiB3ZSBqdXN0IHJlcGxhY2UgdGhlIGB0aGF0LnNvbWV0aGluZ2AgcGFydCBvZiBgdGhhdC5zb21ldGhpbmcuc29tZXRoaW5nMi5zb21ldGhpbmczLnNvbWV0aGluZzRgLFxuXHRcdFx0Ly8gdGhlbiB0cy1zaW1wbGUtYXN0IHRocm93cyBhbiBlcnJvci4gU28gcmVwbGFjaW5nIHRoZSBlbnRpcmVcblx0XHRcdC8vIGNoYWluZWQgUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uIGluc3RlYWQuXG5cdFx0XHRsZXQgcGFyZW50TW9zdFByb3BBY2Nlc3MgPSBwcm9wQWNjZXNzIGFzIE5vZGU7XG5cdFx0XHR3aGlsZSggcGFyZW50TW9zdFByb3BBY2Nlc3MuZ2V0UGFyZW50SWZLaW5kKCBTeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiApICkge1xuXHRcdFx0XHRwYXJlbnRNb3N0UHJvcEFjY2VzcyA9IHBhcmVudE1vc3RQcm9wQWNjZXNzLmdldFBhcmVudCgpITtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgbmV3VGV4dCA9IHBhcmVudE1vc3RQcm9wQWNjZXNzLmdldFRleHQoKVxuXHRcdFx0XHQucmVwbGFjZSggbmV3IFJlZ0V4cCggJ14nICsgdGhpc1ZhcklkZW50aWZpZXIgKSwgJ3RoaXMnICk7XG5cblx0XHRcdHBhcmVudE1vc3RQcm9wQWNjZXNzLnJlcGxhY2VXaXRoVGV4dCggbmV3VGV4dCApO1xuXG5cdFx0XHQvLyBPbGQgd29ya2Fyb3VuZCAjMjogRmFpbGVkIGF0IDQgbGV2ZWxzIG9mIHByb3BlcnRpZXM6XG5cdFx0XHQvLyAgICB0aGF0LnNvbWV0aGluZzEuc29tZXRoaW5nMi5zb21ldGhpbmczLnNvbWV0aGluZzRcblx0XHRcdC8vIGNvbnN0IG5ld1RleHQgPSBwcm9wQWNjZXNzVGV4dFxuXHRcdFx0Ly8gXHQucmVwbGFjZSggbmV3IFJlZ0V4cCggJ14nICsgdGhpc1ZhcklkZW50aWZpZXIgKSwgJ3RoaXMnICk7XG5cdFx0XHQvL1xuXHRcdFx0Ly8gY29uc29sZS5sb2coICduZXcgdGV4dDogJywgbmV3VGV4dCApO1xuXHRcdFx0Ly8gcHJvcEFjY2Vzcy5yZXBsYWNlV2l0aFRleHQoIG5ld1RleHQgKTtcblxuXHRcdFx0Ly8gT2xkIGNvZGUgd2hpY2ggdGhyZXcgYW4gZXJyb3Igd2hlbiB3ZSBoYWQgYSBsb25nIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvblxuXHRcdFx0Ly8gbGlrZSBgdGhhdC5zb21ldGhpbmcxLnNvbWV0aGluZzIuc29tZXRoaW5nM2Bcblx0XHRcdC8vY29uc3QgaWRlbnRpZmllciA9IHByb3BBY2Nlc3MuZ2V0RXhwcmVzc2lvbigpIGFzIElkZW50aWZpZXI7XG5cdFx0XHQvL2lkZW50aWZpZXIucmVwbGFjZVdpdGhUZXh0KCBgdGhpc2AgKTtcblxuXHRcdH0gY2F0Y2goIGVycm9yICkge1xuXHRcdFx0dGhyb3cgbmV3IFRyYWNlRXJyb3IoIGBcblx0XHRcdFx0QW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgYXR0ZW1wdGluZyB0byBjb252ZXJ0IHRoZSBleHByZXNzaW9uOlxuXHRcdFx0XHQgICR7cHJvcEFjY2Vzc1RleHR9IFxuXHRcdFx0XHR0byByZXBsYWNlICcke3RoaXNWYXJJZGVudGlmaWVyfScgd2l0aCB0aGUgJ3RoaXMnIGtleXdvcmQuXG5cdFx0XHRcdFxuXHRcdFx0XHRXYXMgbG9va2luZyBhdCBub2RlIHdpdGggdGV4dDpcblx0XHRcdFx0XG5cdFx0XHRcdCR7bm9kZVRleHR9XG5cdFx0XHRgLnRyaW0oKS5yZXBsYWNlKCAvXlxcdCovZ20sICcnICksIGVycm9yICk7XG5cdFx0fVxuXHR9ICk7XG59Il19