"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyOrElementAccessWithObjFilter = exports.isPropertyOrElemementAccessWithObj = void 0;
const is_property_access_with_obj_1 = require("./is-property-access-with-obj");
const is_element_access_with_obj_1 = require("./is-element-access-with-obj");
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
function isPropertyOrElemementAccessWithObj(node, objIdentifier) {
    return (0, is_property_access_with_obj_1.isPropertyAccessWithObj)(node, objIdentifier)
        || (0, is_element_access_with_obj_1.isElementAccessWithObj)(node, objIdentifier);
}
exports.isPropertyOrElemementAccessWithObj = isPropertyOrElemementAccessWithObj;
/**
 * Function intended to be used with Array.prototype.filter() to return any
 * PropertyAccessExpression or ElementAccessExpression that uses the object
 * `obj`.
 *
 * For example, in this source code:
 *
 *     const obj = { a: 1, b: 2 };
 *     obj.a = 3;
 *     obj['b'] = 4;
 *
 *     const obj2 = { a: 3, b: 4 };
 *     obj2.a = 5;
 *     obj2['b'] = 6;
 *
 * We can use the following to find the two 'obj2' property accesses:
 *
 *     const propOrElementAccesses = sourceFile
 *         .getDescendantsOfKind( SyntaxKind.PropertyAccessExpression )
 *         .concat( sourceFile
 *             .getDescendantsOfKind( SyntaxKind.ElementAccessExpression )
 *         );
 *
 *     const obj2PropOrElemAccesses = propOrElementAccesses
 *         .filter( propertyOrElementAccessWithObjFilter( 'obj2' ) );
 */
function propertyOrElementAccessWithObjFilter(objIdentifier) {
    return (node) => {
        return isPropertyOrElemementAccessWithObj(node, objIdentifier);
    };
}
exports.propertyOrElementAccessWithObjFilter = propertyOrElementAccessWithObjFilter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtcHJvcGVydHktb3ItZWxlbWVtZW50LWFjY2Vzcy13aXRoLW9iai5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2lzLXByb3BlcnR5LW9yLWVsZW1lbWVudC1hY2Nlc3Mtd2l0aC1vYmoudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0VBQXdFO0FBQ3hFLDZFQUFzRTtBQUV0RTs7Ozs7Ozs7Ozs7R0FXRztBQUNILFNBQWdCLGtDQUFrQyxDQUNqRCxJQUFVLEVBQ1YsYUFBcUI7SUFFckIsT0FBTyxJQUFBLHFEQUF1QixFQUFFLElBQUksRUFBRSxhQUFhLENBQUU7V0FDakQsSUFBQSxtREFBc0IsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFFLENBQUM7QUFDbkQsQ0FBQztBQU5ELGdGQU1DO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5Qkc7QUFDSCxTQUFnQixvQ0FBb0MsQ0FBRSxhQUFxQjtJQUMxRSxPQUFPLENBQUUsSUFBVSxFQUErRCxFQUFFO1FBQ25GLE9BQU8sa0NBQWtDLENBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBRSxDQUFDO0lBQ2xFLENBQUMsQ0FBQztBQUNILENBQUM7QUFKRCxvRkFJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uLCBOb2RlLCBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gfSBmcm9tIFwidHMtbW9ycGhcIjtcbmltcG9ydCB7IGlzUHJvcGVydHlBY2Nlc3NXaXRoT2JqIH0gZnJvbSBcIi4vaXMtcHJvcGVydHktYWNjZXNzLXdpdGgtb2JqXCI7XG5pbXBvcnQgeyBpc0VsZW1lbnRBY2Nlc3NXaXRoT2JqIH0gZnJvbSBcIi4vaXMtZWxlbWVudC1hY2Nlc3Mtd2l0aC1vYmpcIjtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHRoZSBnaXZlbiBgbm9kZWAgaXMgYSBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gb3JcbiAqIEVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uIHdob3NlIG9iamVjdCBpcyBgb2JqYC5cbiAqXG4gKiBFeGFtcGxlLCBpbiB0aGUgZm9sbG93aW5nIGV4cHJlc3Npb246XG4gKlxuICogICAgIG9iai5hXG4gKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiB0cnVlIGlmIGNhbGxlZCBhczpcbiAqXG4gKiAgICAgaXNQcm9wZXJ0eU9yRWxlbWVtZW50QWNjZXNzV2l0aE9iaiggZXhwciwgJ29iaicgKTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlPckVsZW1lbWVudEFjY2Vzc1dpdGhPYmooXG5cdG5vZGU6IE5vZGUsXG5cdG9iaklkZW50aWZpZXI6IHN0cmluZ1xuKTogbm9kZSBpcyBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gfCBFbGVtZW50QWNjZXNzRXhwcmVzc2lvbiB7XG5cdHJldHVybiBpc1Byb3BlcnR5QWNjZXNzV2l0aE9iaiggbm9kZSwgb2JqSWRlbnRpZmllciApXG5cdFx0fHwgaXNFbGVtZW50QWNjZXNzV2l0aE9iaiggbm9kZSwgb2JqSWRlbnRpZmllciApO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIGludGVuZGVkIHRvIGJlIHVzZWQgd2l0aCBBcnJheS5wcm90b3R5cGUuZmlsdGVyKCkgdG8gcmV0dXJuIGFueVxuICogUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uIG9yIEVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uIHRoYXQgdXNlcyB0aGUgb2JqZWN0XG4gKiBgb2JqYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgaW4gdGhpcyBzb3VyY2UgY29kZTpcbiAqXG4gKiAgICAgY29uc3Qgb2JqID0geyBhOiAxLCBiOiAyIH07XG4gKiAgICAgb2JqLmEgPSAzO1xuICogICAgIG9ialsnYiddID0gNDtcbiAqXG4gKiAgICAgY29uc3Qgb2JqMiA9IHsgYTogMywgYjogNCB9O1xuICogICAgIG9iajIuYSA9IDU7XG4gKiAgICAgb2JqMlsnYiddID0gNjtcbiAqXG4gKiBXZSBjYW4gdXNlIHRoZSBmb2xsb3dpbmcgdG8gZmluZCB0aGUgdHdvICdvYmoyJyBwcm9wZXJ0eSBhY2Nlc3NlczpcbiAqXG4gKiAgICAgY29uc3QgcHJvcE9yRWxlbWVudEFjY2Vzc2VzID0gc291cmNlRmlsZVxuICogICAgICAgICAuZ2V0RGVzY2VuZGFudHNPZktpbmQoIFN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uIClcbiAqICAgICAgICAgLmNvbmNhdCggc291cmNlRmlsZVxuICogICAgICAgICAgICAgLmdldERlc2NlbmRhbnRzT2ZLaW5kKCBTeW50YXhLaW5kLkVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uIClcbiAqICAgICAgICAgKTtcbiAqXG4gKiAgICAgY29uc3Qgb2JqMlByb3BPckVsZW1BY2Nlc3NlcyA9IHByb3BPckVsZW1lbnRBY2Nlc3Nlc1xuICogICAgICAgICAuZmlsdGVyKCBwcm9wZXJ0eU9yRWxlbWVudEFjY2Vzc1dpdGhPYmpGaWx0ZXIoICdvYmoyJyApICk7XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9wZXJ0eU9yRWxlbWVudEFjY2Vzc1dpdGhPYmpGaWx0ZXIoIG9iaklkZW50aWZpZXI6IHN0cmluZyApOiAoIG5vZGU6IE5vZGUgKSA9PiBub2RlIGlzIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiB8IEVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uIHtcblx0cmV0dXJuICggbm9kZTogTm9kZSApOiBub2RlIGlzIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiB8IEVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uID0+IHtcblx0XHRyZXR1cm4gaXNQcm9wZXJ0eU9yRWxlbWVtZW50QWNjZXNzV2l0aE9iaiggbm9kZSwgb2JqSWRlbnRpZmllciApO1xuXHR9O1xufSJdfQ==