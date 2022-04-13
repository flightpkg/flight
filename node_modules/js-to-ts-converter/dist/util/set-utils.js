"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.difference = exports.union = void 0;
/**
 * Unions two or more sets to create a combined set. Does not mutate the input
 * sets.
 */
function union(setA, ...sets) {
    const union = new Set(setA);
    sets.forEach(currentSet => {
        for (const elem of currentSet) {
            union.add(elem);
        }
    });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0LXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvc2V0LXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7R0FHRztBQUNILFNBQWdCLEtBQUssQ0FBSyxJQUFZLEVBQUUsR0FBRyxJQUFjO0lBQ3hELE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUFLLElBQUksQ0FBRSxDQUFDO0lBRWpDLElBQUksQ0FBQyxPQUFPLENBQUUsVUFBVSxDQUFDLEVBQUU7UUFDMUIsS0FBSyxNQUFNLElBQUksSUFBSSxVQUFVLEVBQUc7WUFDL0IsS0FBSyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBQztTQUNsQjtJQUNGLENBQUMsQ0FBRSxDQUFDO0lBQ0osT0FBTyxLQUFLLENBQUM7QUFDZCxDQUFDO0FBVEQsc0JBU0M7QUFHRDs7O0dBR0c7QUFDSCxTQUFnQixVQUFVLENBQUssSUFBWSxFQUFFLElBQVk7SUFDeEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUUsSUFBSSxDQUFFLENBQUM7SUFDbkMsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLEVBQUc7UUFDekIsVUFBVSxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUUsQ0FBQztLQUMxQjtJQUNELE9BQU8sVUFBVSxDQUFDO0FBQ25CLENBQUM7QUFORCxnQ0FNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVW5pb25zIHR3byBvciBtb3JlIHNldHMgdG8gY3JlYXRlIGEgY29tYmluZWQgc2V0LiBEb2VzIG5vdCBtdXRhdGUgdGhlIGlucHV0XG4gKiBzZXRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5pb248VD4oIHNldEE6IFNldDxUPiwgLi4uc2V0czogU2V0PFQ+W10gKSB7XG5cdGNvbnN0IHVuaW9uID0gbmV3IFNldDxUPiggc2V0QSApO1xuXG5cdHNldHMuZm9yRWFjaCggY3VycmVudFNldCA9PiB7XG5cdFx0Zm9yKCBjb25zdCBlbGVtIG9mIGN1cnJlbnRTZXQgKSB7XG5cdFx0XHR1bmlvbi5hZGQoIGVsZW0gKTtcblx0XHR9XG5cdH0gKTtcblx0cmV0dXJuIHVuaW9uO1xufVxuXG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgZWxlbWVudHMgb2YgYHNldEJgIGZyb20gYHNldEFgIHRvIHByb2R1Y2UgdGhlIGRpZmZlcmVuY2UuIERvZXNcbiAqIG5vdCBtdXRhdGUgdGhlIGlucHV0IHNldHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaWZmZXJlbmNlPFQ+KCBzZXRBOiBTZXQ8VD4sIHNldEI6IFNldDxUPiApIHtcblx0Y29uc3QgZGlmZmVyZW5jZSA9IG5ldyBTZXQoIHNldEEgKTtcblx0Zm9yKCBjb25zdCBlbGVtIG9mIHNldEIgKSB7XG5cdFx0ZGlmZmVyZW5jZS5kZWxldGUoIGVsZW0gKTtcblx0fVxuXHRyZXR1cm4gZGlmZmVyZW5jZTtcbn0iXX0=