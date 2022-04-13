"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDestructuredProps = void 0;
const ts_morph_1 = require("ts-morph");
/**
 * Given a ts.ObjectBindingPattern node, returns an array of the names that
 * are bound to it.
 *
 * These names are essentially the property names pulled out of the object.
 *
 * Example:
 *
 *     var { a, b } = this;
 *
 * Returns:
 *
 *     [ 'a', 'b' ]
 */
function parseDestructuredProps(node) {
    const elements = node.elements;
    return elements
        .filter((element) => {
        return element.name.kind === ts_morph_1.SyntaxKind.Identifier;
    })
        .map((element) => {
        return element.name.text;
    });
}
exports.parseDestructuredProps = parseDestructuredProps;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UtZGVzdHJ1Y3R1cmVkLXByb3BzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvcGFyc2UtZGVzdHJ1Y3R1cmVkLXByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUEwQztBQUUxQzs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsU0FBZ0Isc0JBQXNCLENBQUUsSUFBNkI7SUFDcEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUUvQixPQUFPLFFBQVE7U0FDYixNQUFNLENBQUUsQ0FBRSxPQUEwQixFQUFHLEVBQUU7UUFDekMsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxxQkFBVSxDQUFDLFVBQVUsQ0FBQztJQUNwRCxDQUFDLENBQUU7U0FDRixHQUFHLENBQUUsQ0FBRSxPQUEwQixFQUFHLEVBQUU7UUFDdEMsT0FBUyxPQUFPLENBQUMsSUFBdUIsQ0FBQyxJQUFJLENBQUM7SUFDL0MsQ0FBQyxDQUFFLENBQUM7QUFDTixDQUFDO0FBVkQsd0RBVUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB0cywgU3ludGF4S2luZCB9IGZyb20gXCJ0cy1tb3JwaFwiO1xuXG4vKipcbiAqIEdpdmVuIGEgdHMuT2JqZWN0QmluZGluZ1BhdHRlcm4gbm9kZSwgcmV0dXJucyBhbiBhcnJheSBvZiB0aGUgbmFtZXMgdGhhdFxuICogYXJlIGJvdW5kIHRvIGl0LlxuICpcbiAqIFRoZXNlIG5hbWVzIGFyZSBlc3NlbnRpYWxseSB0aGUgcHJvcGVydHkgbmFtZXMgcHVsbGVkIG91dCBvZiB0aGUgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgIHZhciB7IGEsIGIgfSA9IHRoaXM7XG4gKlxuICogUmV0dXJuczpcbiAqXG4gKiAgICAgWyAnYScsICdiJyBdXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZURlc3RydWN0dXJlZFByb3BzKCBub2RlOiB0cy5PYmplY3RCaW5kaW5nUGF0dGVybiApOiBzdHJpbmdbXSB7XG5cdGNvbnN0IGVsZW1lbnRzID0gbm9kZS5lbGVtZW50cztcblxuXHRyZXR1cm4gZWxlbWVudHNcblx0XHQuZmlsdGVyKCAoIGVsZW1lbnQ6IHRzLkJpbmRpbmdFbGVtZW50ICkgPT4ge1xuXHRcdFx0cmV0dXJuIGVsZW1lbnQubmFtZS5raW5kID09PSBTeW50YXhLaW5kLklkZW50aWZpZXI7XG5cdFx0fSApXG5cdFx0Lm1hcCggKCBlbGVtZW50OiB0cy5CaW5kaW5nRWxlbWVudCApID0+IHtcblx0XHRcdHJldHVybiAoIGVsZW1lbnQubmFtZSBhcyB0cy5JZGVudGlmaWVyICkudGV4dDtcblx0XHR9ICk7XG59Il19