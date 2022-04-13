"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyAccessWithObjFilter = exports.isPropertyAccessWithObj = void 0;
const ts_morph_1 = require("ts-morph");
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
function isPropertyAccessWithObj(node, objIdentifier) {
    if (!ts_morph_1.Node.isPropertyAccessExpression(node)) {
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
exports.isPropertyAccessWithObj = isPropertyAccessWithObj;
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
function propertyAccessWithObjFilter(objIdentifier) {
    return (node) => {
        return isPropertyAccessWithObj(node, objIdentifier);
    };
}
exports.propertyAccessWithObjFilter = propertyAccessWithObjFilter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtcHJvcGVydHktYWNjZXNzLXdpdGgtb2JqLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvaXMtcHJvcGVydHktYWNjZXNzLXdpdGgtb2JqLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUFzRTtBQUV0RTs7Ozs7Ozs7Ozs7R0FXRztBQUNILFNBQWdCLHVCQUF1QixDQUN0QyxJQUFVLEVBQ1YsYUFBcUI7SUFFckIsSUFBSSxDQUFDLGVBQUksQ0FBQywwQkFBMEIsQ0FBRSxJQUFJLENBQUUsRUFBRztRQUM5QyxPQUFPLEtBQUssQ0FBQztLQUNiO0lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBRWxDLElBQUksYUFBYSxLQUFLLE1BQU0sRUFBRztRQUM5QixPQUFPLGVBQUksQ0FBQyxnQkFBZ0IsQ0FBRSxJQUFJLENBQUUsQ0FBQztLQUVyQztTQUFNLElBQUksZUFBSSxDQUFDLFlBQVksQ0FBRSxJQUFJLENBQUUsRUFBRztRQUN0QyxNQUFNLFVBQVUsR0FBRyxJQUFrQixDQUFDO1FBRXRDLE9BQU8sVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLGFBQWEsQ0FBQztLQUU5QztTQUFNO1FBQ04sT0FBTyxLQUFLLENBQUM7S0FDYjtBQUNGLENBQUM7QUFyQkQsMERBcUJDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxTQUFnQiwyQkFBMkIsQ0FBRSxhQUFxQjtJQUNqRSxPQUFPLENBQUUsSUFBVSxFQUFxQyxFQUFFO1FBQ3pELE9BQU8sdUJBQXVCLENBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBRSxDQUFDO0lBQ3ZELENBQUMsQ0FBQztBQUNILENBQUM7QUFKRCxrRUFJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElkZW50aWZpZXIsIE5vZGUsIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiB9IGZyb20gXCJ0cy1tb3JwaFwiO1xuXG4vKipcbiAqIERldGVybWluZXMgaWYgdGhlIGdpdmVuIGBub2RlYCBpcyBhIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiBvclxuICogRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24gd2hvc2Ugb2JqZWN0IGlzIGBvYmpgLlxuICpcbiAqIEV4YW1wbGUsIGluIHRoZSBmb2xsb3dpbmcgZXhwcmVzc2lvbjpcbiAqXG4gKiAgICAgb2JqLmFcbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHRydWUgaWYgY2FsbGVkIGFzOlxuICpcbiAqICAgICBpc1Byb3BlcnR5T3JFbGVtZW1lbnRBY2Nlc3NXaXRoT2JqKCBleHByLCAnb2JqJyApO1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eUFjY2Vzc1dpdGhPYmooXG5cdG5vZGU6IE5vZGUsXG5cdG9iaklkZW50aWZpZXI6IHN0cmluZ1xuKTogbm9kZSBpcyBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24ge1xuXHRpZiggIU5vZGUuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24oIG5vZGUgKSApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRjb25zdCBleHByID0gbm9kZS5nZXRFeHByZXNzaW9uKCk7XG5cblx0aWYoIG9iaklkZW50aWZpZXIgPT09ICd0aGlzJyApIHtcblx0XHRyZXR1cm4gTm9kZS5pc1RoaXNFeHByZXNzaW9uKCBleHByICk7XG5cblx0fSBlbHNlIGlmKCBOb2RlLmlzSWRlbnRpZmllciggZXhwciApICkge1xuXHRcdGNvbnN0IGlkZW50aWZpZXIgPSBleHByIGFzIElkZW50aWZpZXI7XG5cblx0XHRyZXR1cm4gaWRlbnRpZmllci5nZXRUZXh0KCkgPT09IG9iaklkZW50aWZpZXI7XG5cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBpbnRlbmRlZCB0byBiZSB1c2VkIHdpdGggQXJyYXkucHJvdG90eXBlLmZpbHRlcigpIHRvIHJldHVybiBhbnlcbiAqIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiB0aGF0IHVzZXMgdGhlIG9iamVjdCBgb2JqYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgaW4gdGhpcyBzb3VyY2UgY29kZTpcbiAqXG4gKiAgICAgY29uc3Qgb2JqID0geyBhOiAxLCBiOiAyIH07XG4gKiAgICAgb2JqLmEgPSAzO1xuICpcbiAqICAgICBjb25zdCBvYmoyID0geyBhOiAzLCBiOiA0IH07XG4gKiAgICAgb2JqMi5iID0gNTtcbiAqXG4gKiBXZSBjYW4gdXNlIHRoZSBmb2xsb3dpbmcgdG8gZmluZCB0aGUgJ29iajInIHByb3BlcnR5IGFjY2VzczpcbiAqXG4gKiAgICAgY29uc3QgcHJvcEFjY2Vzc2VzID0gc291cmNlRmlsZVxuICogICAgICAgICAuZ2V0RGVzY2VuZGFudHNPZktpbmQoIFN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uICk7XG4gKlxuICogICAgIGNvbnN0IG9iajJQcm9wQWNjZXNzZXMgPSBwcm9wQWNjZXNzZXNcbiAqICAgICAgICAgLmZpbHRlciggcHJvcEFjY2Vzc1dpdGhPYmpGaWx0ZXIoICdvYmoyJyApICk7XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9wZXJ0eUFjY2Vzc1dpdGhPYmpGaWx0ZXIoIG9iaklkZW50aWZpZXI6IHN0cmluZyApOiAoIG5vZGU6IE5vZGUgKSA9PiBub2RlIGlzIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiB7XG5cdHJldHVybiAoIG5vZGU6IE5vZGUgKTogbm9kZSBpcyBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gPT4ge1xuXHRcdHJldHVybiBpc1Byb3BlcnR5QWNjZXNzV2l0aE9iaiggbm9kZSwgb2JqSWRlbnRpZmllciApO1xuXHR9O1xufSJdfQ==