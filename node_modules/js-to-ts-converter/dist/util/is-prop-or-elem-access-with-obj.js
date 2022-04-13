"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_simple_ast_1 = require("ts-simple-ast");
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
function isPropOrElemAccessWithObj(node, objIdentifier) {
    if (!ts_simple_ast_1.TypeGuards.isPropertyAccessExpression(node) && !ts_simple_ast_1.TypeGuards.isElementAccessExpression(node)) {
        return false;
    }
    const expr = node.getExpression();
    if (objIdentifier === 'this') {
        return ts_simple_ast_1.TypeGuards.isThisExpression(expr);
    }
    else if (ts_simple_ast_1.TypeGuards.isIdentifier(expr)) {
        const identifier = expr;
        return identifier.getText() === objIdentifier;
    }
    else {
        return false;
    }
}
exports.isPropOrElemAccessWithObj = isPropOrElemAccessWithObj;
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
 *     const propAccesses = sourceFile
 *         .getDescendantsOfKind( SyntaxKind.PropertyAccessExpression );
 *
 *     const obj2PropAccesses = propAccesses
 *         .filter( topLevelPropOrElemAccessFilter( 'obj2' ) );
 */
function propOrElemAccessWithObjFilter(objIdentifier) {
    return (node) => {
        return isPropOrElemAccessWithObj(node, objIdentifier);
    };
}
exports.propOrElemAccessWithObjFilter = propOrElemAccessWithObjFilter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtcHJvcC1vci1lbGVtLWFjY2Vzcy13aXRoLW9iai5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2lzLXByb3Atb3ItZWxlbS1hY2Nlc3Mtd2l0aC1vYmoudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpREFBZ0g7QUFFaEg7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxtQ0FDQyxJQUFVLEVBQ1YsYUFBcUI7SUFFckIsSUFBSSxDQUFDLDBCQUFVLENBQUMsMEJBQTBCLENBQUUsSUFBSSxDQUFFLElBQUksQ0FBQywwQkFBVSxDQUFDLHlCQUF5QixDQUFFLElBQUksQ0FBRSxFQUFHO1FBQ3JHLE9BQU8sS0FBSyxDQUFDO0tBQ2I7SUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFFbEMsSUFBSSxhQUFhLEtBQUssTUFBTSxFQUFHO1FBQzlCLE9BQU8sMEJBQVUsQ0FBQyxnQkFBZ0IsQ0FBRSxJQUFJLENBQUUsQ0FBQztLQUUzQztTQUFNLElBQUksMEJBQVUsQ0FBQyxZQUFZLENBQUUsSUFBSSxDQUFFLEVBQUc7UUFDNUMsTUFBTSxVQUFVLEdBQUcsSUFBa0IsQ0FBQztRQUV0QyxPQUFPLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxhQUFhLENBQUM7S0FFOUM7U0FBTTtRQUNOLE9BQU8sS0FBSyxDQUFDO0tBQ2I7QUFDRixDQUFDO0FBckJELDhEQXFCQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ0gsdUNBQStDLGFBQXFCO0lBQ25FLE9BQU8sQ0FBRSxJQUFVLEVBQStELEVBQUU7UUFDbkYsT0FBTyx5QkFBeUIsQ0FBRSxJQUFJLEVBQUUsYUFBYSxDQUFFLENBQUM7SUFDekQsQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQUpELHNFQUlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24sIElkZW50aWZpZXIsIE5vZGUsIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiwgVHlwZUd1YXJkcyB9IGZyb20gXCJ0cy1zaW1wbGUtYXN0XCI7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgZ2l2ZW4gYG5vZGVgIGlzIGEgUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uIG9yXG4gKiBFbGVtZW50QWNjZXNzRXhwcmVzc2lvbiB3aG9zZSBvYmplY3QgaXMgYG9iamAuXG4gKlxuICogRXhhbXBsZSwgaW4gdGhlIGZvbGxvd2luZyBleHByZXNzaW9uOlxuICpcbiAqICAgICBvYmouYVxuICpcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCByZXR1cm4gdHJ1ZSBpZiBjYWxsZWQgYXM6XG4gKlxuICogICAgIGlzUHJvcE9yRWxlbUFjY2Vzc1dpdGhPYmooIGV4cHIsICdvYmonICk7XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BPckVsZW1BY2Nlc3NXaXRoT2JqKFxuXHRub2RlOiBOb2RlLFxuXHRvYmpJZGVudGlmaWVyOiBzdHJpbmdcbik6IG5vZGUgaXMgUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uIHwgRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24ge1xuXHRpZiggIVR5cGVHdWFyZHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24oIG5vZGUgKSAmJiAhVHlwZUd1YXJkcy5pc0VsZW1lbnRBY2Nlc3NFeHByZXNzaW9uKCBub2RlICkgKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Y29uc3QgZXhwciA9IG5vZGUuZ2V0RXhwcmVzc2lvbigpO1xuXG5cdGlmKCBvYmpJZGVudGlmaWVyID09PSAndGhpcycgKSB7XG5cdFx0cmV0dXJuIFR5cGVHdWFyZHMuaXNUaGlzRXhwcmVzc2lvbiggZXhwciApO1xuXG5cdH0gZWxzZSBpZiggVHlwZUd1YXJkcy5pc0lkZW50aWZpZXIoIGV4cHIgKSApIHtcblx0XHRjb25zdCBpZGVudGlmaWVyID0gZXhwciBhcyBJZGVudGlmaWVyO1xuXG5cdFx0cmV0dXJuIGlkZW50aWZpZXIuZ2V0VGV4dCgpID09PSBvYmpJZGVudGlmaWVyO1xuXG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gaW50ZW5kZWQgdG8gYmUgdXNlZCB3aXRoIEFycmF5LnByb3RvdHlwZS5maWx0ZXIoKSB0byByZXR1cm4gYW55XG4gKiBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gb3IgRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24gdGhhdCB1c2VzIHRoZSBvYmplY3RcbiAqIGBvYmpgLlxuICpcbiAqIEZvciBleGFtcGxlLCBpbiB0aGlzIHNvdXJjZSBjb2RlOlxuICpcbiAqICAgICBjb25zdCBvYmogPSB7IGE6IDEsIGI6IDIgfTtcbiAqICAgICBvYmouYSA9IDM7XG4gKiAgICAgb2JqWydiJ10gPSA0O1xuICpcbiAqICAgICBjb25zdCBvYmoyID0geyBhOiAzLCBiOiA0IH07XG4gKiAgICAgb2JqMi5hID0gNTtcbiAqICAgICBvYmoyWydiJ10gPSA2O1xuICpcbiAqIFdlIGNhbiB1c2UgdGhlIGZvbGxvd2luZyB0byBmaW5kIHRoZSB0d28gJ29iajInIHByb3BlcnR5IGFjY2Vzc2VzOlxuICpcbiAqICAgICBjb25zdCBwcm9wQWNjZXNzZXMgPSBzb3VyY2VGaWxlXG4gKiAgICAgICAgIC5nZXREZXNjZW5kYW50c09mS2luZCggU3ludGF4S2luZC5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gKTtcbiAqXG4gKiAgICAgY29uc3Qgb2JqMlByb3BBY2Nlc3NlcyA9IHByb3BBY2Nlc3Nlc1xuICogICAgICAgICAuZmlsdGVyKCB0b3BMZXZlbFByb3BPckVsZW1BY2Nlc3NGaWx0ZXIoICdvYmoyJyApICk7XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9wT3JFbGVtQWNjZXNzV2l0aE9iakZpbHRlciggb2JqSWRlbnRpZmllcjogc3RyaW5nICkge1xuXHRyZXR1cm4gKCBub2RlOiBOb2RlICk6IG5vZGUgaXMgUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uIHwgRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24gPT4ge1xuXHRcdHJldHVybiBpc1Byb3BPckVsZW1BY2Nlc3NXaXRoT2JqKCBub2RlLCBvYmpJZGVudGlmaWVyICk7XG5cdH07XG59Il19