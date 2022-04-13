"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const set_utils_1 = require("../util/set-utils");
/**
 * Represents a JavaScript class found in a source file.
 */
class JsClass {
    constructor(cfg) {
        this.path = cfg.path;
        this.name = cfg.name;
        this.superclassName = cfg.superclassName;
        this.superclassPath = cfg.superclassPath;
        this.methods = cfg.methods;
        this.properties = cfg.properties;
        this.members = set_utils_1.union(this.methods, this.properties);
    }
    /**
     * String identifier for the JsClass which is a combination of its file path
     * and class name. Used to store JsClass nodes on a graphlib Graph.
     */
    get id() {
        return `${this.path}_${this.name}`;
    }
    /**
     * Retrieves the ID of the superclass JsClass instance, if the JsClass has
     * one. If not, returns undefined.
     */
    get superclassId() {
        if (this.isSuperclassInNodeModules()) {
            // If the superclass is in the node_modules folder, we'll
            // essentially treat this JsClass as if it didn't have a superclass.
            // See `isSuperclassInNodeModules()` jsdoc for details.
            return undefined;
        }
        else {
            return this.superclassName && `${this.superclassPath}_${this.superclassName}`;
        }
    }
    /**
     * Determines if the JsClass's superclass was found in the node_modules
     * directory (i.e. it extends from another package).
     *
     * If so, we're not going to try to understand a possibly ES5 module for
     * its properties, so we'll just stop processing at that point.
     */
    isSuperclassInNodeModules() {
        return !!this.superclassPath && /[\\\/]node_modules[\\\/]/.test(this.superclassPath);
    }
}
exports.JsClass = JsClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMtY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWwvanMtY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpREFBMEM7QUFFMUM7O0dBRUc7QUFDSDtJQVNDLFlBQWEsR0FPWjtRQUNBLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQztRQUN6QyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFDM0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDO1FBRWpDLElBQUksQ0FBQyxPQUFPLEdBQUcsaUJBQUssQ0FBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsSUFBVyxFQUFFO1FBQ1osT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxJQUFXLFlBQVk7UUFDdEIsSUFBSSxJQUFJLENBQUMseUJBQXlCLEVBQUUsRUFBRztZQUN0Qyx5REFBeUQ7WUFDekQsb0VBQW9FO1lBQ3BFLHVEQUF1RDtZQUN2RCxPQUFPLFNBQVMsQ0FBQztTQUVqQjthQUFNO1lBQ04sT0FBTyxJQUFJLENBQUMsY0FBYyxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDOUU7SUFDRixDQUFDO0lBR0Q7Ozs7OztPQU1HO0lBQ0kseUJBQXlCO1FBQy9CLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksMEJBQTBCLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxjQUFjLENBQUUsQ0FBQztJQUN4RixDQUFDO0NBRUQ7QUEvREQsMEJBK0RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdW5pb24gfSBmcm9tIFwiLi4vdXRpbC9zZXQtdXRpbHNcIjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgSmF2YVNjcmlwdCBjbGFzcyBmb3VuZCBpbiBhIHNvdXJjZSBmaWxlLlxuICovXG5leHBvcnQgY2xhc3MgSnNDbGFzcyB7XG5cdHB1YmxpYyByZWFkb25seSBwYXRoOiBzdHJpbmc7XG5cdHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7ICAgICAgICAgICAgIC8vIHdpbGwgYmUgdW5kZWZpbmVkIGZvciBhIGRlZmF1bHQgZXhwb3J0IGNsYXNzXG5cdHB1YmxpYyByZWFkb25seSBzdXBlcmNsYXNzTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkOyAgICAgICAvLyB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm8gc3VwZXJjbGFzc1xuXHRwdWJsaWMgcmVhZG9ubHkgc3VwZXJjbGFzc1BhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDsgICAvLyB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm8gc3VwZXJjbGFzc1xuXHRwdWJsaWMgcmVhZG9ubHkgbWV0aG9kczogU2V0PHN0cmluZz47XG5cdHB1YmxpYyByZWFkb25seSBwcm9wZXJ0aWVzOiBTZXQ8c3RyaW5nPjtcblx0cHVibGljIHJlYWRvbmx5IG1lbWJlcnM6IFNldDxzdHJpbmc+OyAgLy8gYSB1bmlvbiBvZiB0aGUgbWV0aG9kcyBhbmQgcHJvcGVydGllcyBTZXRzXG5cblx0Y29uc3RydWN0b3IoIGNmZzoge1xuXHRcdHBhdGg6IHN0cmluZztcblx0XHRuYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0c3VwZXJjbGFzc05hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRzdXBlcmNsYXNzUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdG1ldGhvZHM6IFNldDxzdHJpbmc+O1xuXHRcdHByb3BlcnRpZXM6IFNldDxzdHJpbmc+O1xuXHR9ICkge1xuXHRcdHRoaXMucGF0aCA9IGNmZy5wYXRoO1xuXHRcdHRoaXMubmFtZSA9IGNmZy5uYW1lO1xuXHRcdHRoaXMuc3VwZXJjbGFzc05hbWUgPSBjZmcuc3VwZXJjbGFzc05hbWU7XG5cdFx0dGhpcy5zdXBlcmNsYXNzUGF0aCA9IGNmZy5zdXBlcmNsYXNzUGF0aDtcblx0XHR0aGlzLm1ldGhvZHMgPSBjZmcubWV0aG9kcztcblx0XHR0aGlzLnByb3BlcnRpZXMgPSBjZmcucHJvcGVydGllcztcblxuXHRcdHRoaXMubWVtYmVycyA9IHVuaW9uKCB0aGlzLm1ldGhvZHMsIHRoaXMucHJvcGVydGllcyApO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0cmluZyBpZGVudGlmaWVyIGZvciB0aGUgSnNDbGFzcyB3aGljaCBpcyBhIGNvbWJpbmF0aW9uIG9mIGl0cyBmaWxlIHBhdGhcblx0ICogYW5kIGNsYXNzIG5hbWUuIFVzZWQgdG8gc3RvcmUgSnNDbGFzcyBub2RlcyBvbiBhIGdyYXBobGliIEdyYXBoLlxuXHQgKi9cblx0cHVibGljIGdldCBpZCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiBgJHt0aGlzLnBhdGh9XyR7dGhpcy5uYW1lfWA7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBJRCBvZiB0aGUgc3VwZXJjbGFzcyBKc0NsYXNzIGluc3RhbmNlLCBpZiB0aGUgSnNDbGFzcyBoYXNcblx0ICogb25lLiBJZiBub3QsIHJldHVybnMgdW5kZWZpbmVkLlxuXHQgKi9cblx0cHVibGljIGdldCBzdXBlcmNsYXNzSWQoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRpZiggdGhpcy5pc1N1cGVyY2xhc3NJbk5vZGVNb2R1bGVzKCkgKSB7XG5cdFx0XHQvLyBJZiB0aGUgc3VwZXJjbGFzcyBpcyBpbiB0aGUgbm9kZV9tb2R1bGVzIGZvbGRlciwgd2UnbGxcblx0XHRcdC8vIGVzc2VudGlhbGx5IHRyZWF0IHRoaXMgSnNDbGFzcyBhcyBpZiBpdCBkaWRuJ3QgaGF2ZSBhIHN1cGVyY2xhc3MuXG5cdFx0XHQvLyBTZWUgYGlzU3VwZXJjbGFzc0luTm9kZU1vZHVsZXMoKWAganNkb2MgZm9yIGRldGFpbHMuXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLnN1cGVyY2xhc3NOYW1lICYmIGAke3RoaXMuc3VwZXJjbGFzc1BhdGh9XyR7dGhpcy5zdXBlcmNsYXNzTmFtZX1gO1xuXHRcdH1cblx0fVxuXG5cblx0LyoqXG5cdCAqIERldGVybWluZXMgaWYgdGhlIEpzQ2xhc3MncyBzdXBlcmNsYXNzIHdhcyBmb3VuZCBpbiB0aGUgbm9kZV9tb2R1bGVzXG5cdCAqIGRpcmVjdG9yeSAoaS5lLiBpdCBleHRlbmRzIGZyb20gYW5vdGhlciBwYWNrYWdlKS5cblx0ICpcblx0ICogSWYgc28sIHdlJ3JlIG5vdCBnb2luZyB0byB0cnkgdG8gdW5kZXJzdGFuZCBhIHBvc3NpYmx5IEVTNSBtb2R1bGUgZm9yXG5cdCAqIGl0cyBwcm9wZXJ0aWVzLCBzbyB3ZSdsbCBqdXN0IHN0b3AgcHJvY2Vzc2luZyBhdCB0aGF0IHBvaW50LlxuXHQgKi9cblx0cHVibGljIGlzU3VwZXJjbGFzc0luTm9kZU1vZHVsZXMoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuICEhdGhpcy5zdXBlcmNsYXNzUGF0aCAmJiAvW1xcXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFxcXC9dLy50ZXN0KCB0aGlzLnN1cGVyY2xhc3NQYXRoICk7XG5cdH1cblxufSJdfQ==