"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementAccessWithObjFilter = exports.isElementAccessWithObj = void 0;
const ts_morph_1 = require("ts-morph");
/**
 * Determines if the given `node` is a ElementAccessExpression whose object is
 * `obj`.
 *
 * Example, in the following expression:
 *
 *     obj['a']
 *
 * This function will return true if called as:
 *
 *     isElementAccessWithObj( expr, 'obj' );
 */
function isElementAccessWithObj(node, objIdentifier) {
    if (!ts_morph_1.Node.isElementAccessExpression(node)) {
        return false;
    }
    const expr = node.getExpression();
    if (objIdentifier === 'this') {
        return ts_morph_1.Node.isThisExpression(expr);
    }
    else if (ts_morph_1.Node.isIdentifier(expr)) {
        const identifier = expr;
        return identifier.getText() === objIdentifier;
    }
    else {
        return false;
    }
}
exports.isElementAccessWithObj = isElementAccessWithObj;
/**
 * Function intended to be used with Array.prototype.filter() to return any
 * ElementAccessExpression that uses the object `obj`.
 *
 * For example, in this source code:
 *
 *     const obj = { a: 1, b: 2 };
 *     obj['a'] = 3;
 *
 *     const obj2 = { a: 3, b: 4 };
 *     obj2['b'] = 5;
 *
 * We can use the following to find the 'obj2' element access:
 *
 *     const propAccesses = sourceFile
 *         .getDescendantsOfKind( SyntaxKind.ElementAccessExpression );
 *
 *     const obj2PropAccesses = propAccesses
 *         .filter( elementAccessWithObjFilter( 'obj2' ) );
 */
function elementAccessWithObjFilter(objIdentifier) {
    return (node) => {
        return isElementAccessWithObj(node, objIdentifier);
    };
}
exports.elementAccessWithObjFilter = elementAccessWithObjFilter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtZWxlbWVudC1hY2Nlc3Mtd2l0aC1vYmouanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbC9pcy1lbGVtZW50LWFjY2Vzcy13aXRoLW9iai50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBcUU7QUFFckU7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxTQUFnQixzQkFBc0IsQ0FDckMsSUFBVSxFQUNWLGFBQXFCO0lBRXJCLElBQUksQ0FBQyxlQUFJLENBQUMseUJBQXlCLENBQUUsSUFBSSxDQUFFLEVBQUc7UUFDN0MsT0FBTyxLQUFLLENBQUM7S0FDYjtJQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUVsQyxJQUFJLGFBQWEsS0FBSyxNQUFNLEVBQUc7UUFDOUIsT0FBTyxlQUFJLENBQUMsZ0JBQWdCLENBQUUsSUFBSSxDQUFFLENBQUM7S0FFckM7U0FBTSxJQUFJLGVBQUksQ0FBQyxZQUFZLENBQUUsSUFBSSxDQUFFLEVBQUc7UUFDdEMsTUFBTSxVQUFVLEdBQUcsSUFBa0IsQ0FBQztRQUV0QyxPQUFPLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxhQUFhLENBQUM7S0FFOUM7U0FBTTtRQUNOLE9BQU8sS0FBSyxDQUFDO0tBQ2I7QUFDRixDQUFDO0FBckJELHdEQXFCQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ0gsU0FBZ0IsMEJBQTBCLENBQUUsYUFBcUI7SUFDaEUsT0FBTyxDQUFFLElBQVUsRUFBb0MsRUFBRTtRQUN4RCxPQUFPLHNCQUFzQixDQUFFLElBQUksRUFBRSxhQUFhLENBQUUsQ0FBQztJQUN0RCxDQUFDLENBQUM7QUFDSCxDQUFDO0FBSkQsZ0VBSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbGVtZW50QWNjZXNzRXhwcmVzc2lvbiwgSWRlbnRpZmllciwgTm9kZSB9IGZyb20gXCJ0cy1tb3JwaFwiO1xuXG4vKipcbiAqIERldGVybWluZXMgaWYgdGhlIGdpdmVuIGBub2RlYCBpcyBhIEVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uIHdob3NlIG9iamVjdCBpc1xuICogYG9iamAuXG4gKlxuICogRXhhbXBsZSwgaW4gdGhlIGZvbGxvd2luZyBleHByZXNzaW9uOlxuICpcbiAqICAgICBvYmpbJ2EnXVxuICpcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCByZXR1cm4gdHJ1ZSBpZiBjYWxsZWQgYXM6XG4gKlxuICogICAgIGlzRWxlbWVudEFjY2Vzc1dpdGhPYmooIGV4cHIsICdvYmonICk7XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VsZW1lbnRBY2Nlc3NXaXRoT2JqKFxuXHRub2RlOiBOb2RlLFxuXHRvYmpJZGVudGlmaWVyOiBzdHJpbmdcbik6IG5vZGUgaXMgRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24ge1xuXHRpZiggIU5vZGUuaXNFbGVtZW50QWNjZXNzRXhwcmVzc2lvbiggbm9kZSApICkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGNvbnN0IGV4cHIgPSBub2RlLmdldEV4cHJlc3Npb24oKTtcblxuXHRpZiggb2JqSWRlbnRpZmllciA9PT0gJ3RoaXMnICkge1xuXHRcdHJldHVybiBOb2RlLmlzVGhpc0V4cHJlc3Npb24oIGV4cHIgKTtcblxuXHR9IGVsc2UgaWYoIE5vZGUuaXNJZGVudGlmaWVyKCBleHByICkgKSB7XG5cdFx0Y29uc3QgaWRlbnRpZmllciA9IGV4cHIgYXMgSWRlbnRpZmllcjtcblxuXHRcdHJldHVybiBpZGVudGlmaWVyLmdldFRleHQoKSA9PT0gb2JqSWRlbnRpZmllcjtcblxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIGludGVuZGVkIHRvIGJlIHVzZWQgd2l0aCBBcnJheS5wcm90b3R5cGUuZmlsdGVyKCkgdG8gcmV0dXJuIGFueVxuICogRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24gdGhhdCB1c2VzIHRoZSBvYmplY3QgYG9iamAuXG4gKlxuICogRm9yIGV4YW1wbGUsIGluIHRoaXMgc291cmNlIGNvZGU6XG4gKlxuICogICAgIGNvbnN0IG9iaiA9IHsgYTogMSwgYjogMiB9O1xuICogICAgIG9ialsnYSddID0gMztcbiAqXG4gKiAgICAgY29uc3Qgb2JqMiA9IHsgYTogMywgYjogNCB9O1xuICogICAgIG9iajJbJ2InXSA9IDU7XG4gKlxuICogV2UgY2FuIHVzZSB0aGUgZm9sbG93aW5nIHRvIGZpbmQgdGhlICdvYmoyJyBlbGVtZW50IGFjY2VzczpcbiAqXG4gKiAgICAgY29uc3QgcHJvcEFjY2Vzc2VzID0gc291cmNlRmlsZVxuICogICAgICAgICAuZ2V0RGVzY2VuZGFudHNPZktpbmQoIFN5bnRheEtpbmQuRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24gKTtcbiAqXG4gKiAgICAgY29uc3Qgb2JqMlByb3BBY2Nlc3NlcyA9IHByb3BBY2Nlc3Nlc1xuICogICAgICAgICAuZmlsdGVyKCBlbGVtZW50QWNjZXNzV2l0aE9iakZpbHRlciggJ29iajInICkgKTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVsZW1lbnRBY2Nlc3NXaXRoT2JqRmlsdGVyKCBvYmpJZGVudGlmaWVyOiBzdHJpbmcgKTogKCBub2RlOiBOb2RlICkgPT4gbm9kZSBpcyBFbGVtZW50QWNjZXNzRXhwcmVzc2lvbiB7XG5cdHJldHVybiAoIG5vZGU6IE5vZGUgKTogbm9kZSBpcyBFbGVtZW50QWNjZXNzRXhwcmVzc2lvbiA9PiB7XG5cdFx0cmV0dXJuIGlzRWxlbWVudEFjY2Vzc1dpdGhPYmooIG5vZGUsIG9iaklkZW50aWZpZXIgKTtcblx0fTtcbn0iXX0=