"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Unions two sets to create a combined set. Does not mutate the input sets.
 */
function union(setA, setB) {
    const union = new Set(setA);
    for (const elem of setB) {
        union.add(elem);
    }
    return union;
}
exports.union = union;
/**
 * Removes the elements of `setB` from `setA` to produce the difference. Does
 * not mutate the input sets.
 */
function difference(setA, setB) {
    const difference = new Set(setA);
    for (const elem of setB) {
        difference.delete(elem);
    }
    return difference;
}
exports.difference = difference;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0LXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL3NldC11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOztHQUVHO0FBQ0gsZUFBMEIsSUFBWSxFQUFFLElBQVk7SUFDbkQsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUssSUFBSSxDQUFFLENBQUM7SUFDakMsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLEVBQUc7UUFDekIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNoQjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQztBQU5ELHNCQU1DO0FBR0Q7OztHQUdHO0FBQ0gsb0JBQStCLElBQVksRUFBRSxJQUFZO0lBQ3hELE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUFFLElBQUksQ0FBRSxDQUFDO0lBQ25DLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxFQUFHO1FBQ3pCLFVBQVUsQ0FBQyxNQUFNLENBQUUsSUFBSSxDQUFFLENBQUM7S0FDMUI7SUFDRCxPQUFPLFVBQVUsQ0FBQztBQUNuQixDQUFDO0FBTkQsZ0NBTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFVuaW9ucyB0d28gc2V0cyB0byBjcmVhdGUgYSBjb21iaW5lZCBzZXQuIERvZXMgbm90IG11dGF0ZSB0aGUgaW5wdXQgc2V0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaW9uPFQ+KCBzZXRBOiBTZXQ8VD4sIHNldEI6IFNldDxUPiApIHtcblx0Y29uc3QgdW5pb24gPSBuZXcgU2V0PFQ+KCBzZXRBICk7XG5cdGZvciggY29uc3QgZWxlbSBvZiBzZXRCICkge1xuXHRcdHVuaW9uLmFkZChlbGVtKTtcblx0fVxuXHRyZXR1cm4gdW5pb247XG59XG5cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBlbGVtZW50cyBvZiBgc2V0QmAgZnJvbSBgc2V0QWAgdG8gcHJvZHVjZSB0aGUgZGlmZmVyZW5jZS4gRG9lc1xuICogbm90IG11dGF0ZSB0aGUgaW5wdXQgc2V0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZlcmVuY2U8VD4oIHNldEE6IFNldDxUPiwgc2V0QjogU2V0PFQ+ICkge1xuXHRjb25zdCBkaWZmZXJlbmNlID0gbmV3IFNldCggc2V0QSApO1xuXHRmb3IoIGNvbnN0IGVsZW0gb2Ygc2V0QiApIHtcblx0XHRkaWZmZXJlbmNlLmRlbGV0ZSggZWxlbSApO1xuXHR9XG5cdHJldHVybiBkaWZmZXJlbmNlO1xufSJdfQ==