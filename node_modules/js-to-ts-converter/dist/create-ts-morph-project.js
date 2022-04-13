"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTsMorphProject = void 0;
const ts_morph_1 = require("ts-morph");
const fast_glob_1 = __importDefault(require("fast-glob"));
/**
 * Creates a ts-morph Project by including the source files under the given
 * `directory`.
 *
 * @param directory The absolute path to the directory of .js files to
 *   include.
 * @param options
 * @param options.indentationText The text used to indent new class property
 *   declarations.
 * @param options.excludePatterns Glob patterns to exclude files.
 */
function createTsMorphProject(directory, options = {}) {
    const tsMorphProject = new ts_morph_1.Project({
        manipulationSettings: {
            indentationText: options.indentationText || ts_morph_1.IndentationText.Tab
        }
    });
    // Read files using fast-glob. fast-glob does a much better job over node-glob
    // at ignoring directories like node_modules without reading all of the files 
    // in them first
    let files = fast_glob_1.default.sync(options.includePatterns || `**/*.+(js|ts|jsx|tsx)`, {
        cwd: directory,
        absolute: true,
        followSymbolicLinks: true,
        // filter out any path which includes node_modules. We don't want to
        // attempt to parse those as they may be ES5, and we also don't accidentally
        // want to write out into the node_modules folder
        ignore: ['**/node_modules/**'].concat(options.excludePatterns || [])
    });
    files.forEach((filePath) => {
        tsMorphProject.addSourceFileAtPath(filePath);
    });
    return tsMorphProject;
}
exports.createTsMorphProject = createTsMorphProject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXRzLW1vcnBoLXByb2plY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY3JlYXRlLXRzLW1vcnBoLXByb2plY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsdUNBQW9EO0FBQ3BELDBEQUFpQztBQUVqQzs7Ozs7Ozs7OztHQVVHO0FBQ0gsU0FBZ0Isb0JBQW9CLENBQUUsU0FBaUIsRUFBRSxVQUlyRCxFQUFFO0lBQ0wsTUFBTSxjQUFjLEdBQUcsSUFBSSxrQkFBTyxDQUFFO1FBQ25DLG9CQUFvQixFQUFFO1lBQ3JCLGVBQWUsRUFBRSxPQUFPLENBQUMsZUFBZSxJQUFJLDBCQUFlLENBQUMsR0FBRztTQUMvRDtLQUNELENBQUUsQ0FBQztJQUVKLDhFQUE4RTtJQUM5RSw4RUFBOEU7SUFDOUUsZ0JBQWdCO0lBQ2hCLElBQUksS0FBSyxHQUFHLG1CQUFRLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBQyxlQUFlLElBQUksdUJBQXVCLEVBQUU7UUFDOUUsR0FBRyxFQUFFLFNBQVM7UUFDZCxRQUFRLEVBQUUsSUFBSTtRQUNkLG1CQUFtQixFQUFFLElBQUk7UUFFekIsb0VBQW9FO1FBQ3BFLDRFQUE0RTtRQUM1RSxpREFBaUQ7UUFDakQsTUFBTSxFQUFFLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUM7S0FDcEUsQ0FBRSxDQUFDO0lBRUosS0FBSyxDQUFDLE9BQU8sQ0FBRSxDQUFFLFFBQWdCLEVBQUcsRUFBRTtRQUNyQyxjQUFjLENBQUMsbUJBQW1CLENBQUUsUUFBUSxDQUFFLENBQUE7SUFDL0MsQ0FBQyxDQUFFLENBQUM7SUFFSixPQUFPLGNBQWMsQ0FBQztBQUN2QixDQUFDO0FBOUJELG9EQThCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByb2plY3QsIEluZGVudGF0aW9uVGV4dCB9IGZyb20gXCJ0cy1tb3JwaFwiO1xuaW1wb3J0IGZhc3RHbG9iIGZyb20gJ2Zhc3QtZ2xvYic7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRzLW1vcnBoIFByb2plY3QgYnkgaW5jbHVkaW5nIHRoZSBzb3VyY2UgZmlsZXMgdW5kZXIgdGhlIGdpdmVuXG4gKiBgZGlyZWN0b3J5YC5cbiAqXG4gKiBAcGFyYW0gZGlyZWN0b3J5IFRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBkaXJlY3Rvcnkgb2YgLmpzIGZpbGVzIHRvXG4gKiAgIGluY2x1ZGUuXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogQHBhcmFtIG9wdGlvbnMuaW5kZW50YXRpb25UZXh0IFRoZSB0ZXh0IHVzZWQgdG8gaW5kZW50IG5ldyBjbGFzcyBwcm9wZXJ0eVxuICogICBkZWNsYXJhdGlvbnMuXG4gKiBAcGFyYW0gb3B0aW9ucy5leGNsdWRlUGF0dGVybnMgR2xvYiBwYXR0ZXJucyB0byBleGNsdWRlIGZpbGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHNNb3JwaFByb2plY3QoIGRpcmVjdG9yeTogc3RyaW5nLCBvcHRpb25zOiB7XG5cdGluZGVudGF0aW9uVGV4dD86IEluZGVudGF0aW9uVGV4dCxcblx0aW5jbHVkZVBhdHRlcm5zPzogc3RyaW5nW10sXG5cdGV4Y2x1ZGVQYXR0ZXJucz86IHN0cmluZ1tdXG59ID0ge30gKSB7XG5cdGNvbnN0IHRzTW9ycGhQcm9qZWN0ID0gbmV3IFByb2plY3QoIHtcblx0XHRtYW5pcHVsYXRpb25TZXR0aW5nczoge1xuXHRcdFx0aW5kZW50YXRpb25UZXh0OiBvcHRpb25zLmluZGVudGF0aW9uVGV4dCB8fCBJbmRlbnRhdGlvblRleHQuVGFiXG5cdFx0fVxuXHR9ICk7XG5cblx0Ly8gUmVhZCBmaWxlcyB1c2luZyBmYXN0LWdsb2IuIGZhc3QtZ2xvYiBkb2VzIGEgbXVjaCBiZXR0ZXIgam9iIG92ZXIgbm9kZS1nbG9iXG5cdC8vIGF0IGlnbm9yaW5nIGRpcmVjdG9yaWVzIGxpa2Ugbm9kZV9tb2R1bGVzIHdpdGhvdXQgcmVhZGluZyBhbGwgb2YgdGhlIGZpbGVzIFxuXHQvLyBpbiB0aGVtIGZpcnN0XG5cdGxldCBmaWxlcyA9IGZhc3RHbG9iLnN5bmMoIG9wdGlvbnMuaW5jbHVkZVBhdHRlcm5zIHx8IGAqKi8qLisoanN8dHN8anN4fHRzeClgLCB7XG5cdFx0Y3dkOiBkaXJlY3RvcnksXG5cdFx0YWJzb2x1dGU6IHRydWUsXG5cdFx0Zm9sbG93U3ltYm9saWNMaW5rczogdHJ1ZSxcblxuXHRcdC8vIGZpbHRlciBvdXQgYW55IHBhdGggd2hpY2ggaW5jbHVkZXMgbm9kZV9tb2R1bGVzLiBXZSBkb24ndCB3YW50IHRvXG5cdFx0Ly8gYXR0ZW1wdCB0byBwYXJzZSB0aG9zZSBhcyB0aGV5IG1heSBiZSBFUzUsIGFuZCB3ZSBhbHNvIGRvbid0IGFjY2lkZW50YWxseVxuXHRcdC8vIHdhbnQgdG8gd3JpdGUgb3V0IGludG8gdGhlIG5vZGVfbW9kdWxlcyBmb2xkZXJcblx0XHRpZ25vcmU6IFsnKiovbm9kZV9tb2R1bGVzLyoqJ10uY29uY2F0KG9wdGlvbnMuZXhjbHVkZVBhdHRlcm5zIHx8IFtdKVxuXHR9ICk7XG5cblx0ZmlsZXMuZm9yRWFjaCggKCBmaWxlUGF0aDogc3RyaW5nICkgPT4ge1xuXHRcdHRzTW9ycGhQcm9qZWN0LmFkZFNvdXJjZUZpbGVBdFBhdGgoIGZpbGVQYXRoIClcblx0fSApO1xuXG5cdHJldHVybiB0c01vcnBoUHJvamVjdDtcbn1cblxuIl19