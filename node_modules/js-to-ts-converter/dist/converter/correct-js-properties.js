"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_class_1 = require("../model/js-class");
const graphlib_1 = require("graphlib");
/**
 * After the graph of original {@link JsClass}es and their properties have been
 * created, we need to remove properties from subclasses that are defined in
 * their superclasses.
 *
 * This function takes the original graph of classes with all properties in each
 * class and returns a new list of JsClasses with the properties properly
 * filtered so that subclasses do not define the same properties that are
 * already present in their superclasses.
 *
 * ## Algorithm
 *
 * 1. Build graph of subclasses -> superclasses
 * 2. Take topological sort of graph
 * 3. Starting at the superclasses in the sort, fill in the
 *    propertySets for each JsClass. For every subclass encountered,
 *    filter out its superclass properties to create the subclass's property
 *    set
 * 4. Use the propertySets to create a new list of JsClasses
 */
function correctJsProperties(jsClasses) {
    const jsClassHierarchyGraph = new graphlib_1.Graph();
    // First, add all nodes to the graph
    jsClasses.forEach(jsClass => {
        jsClassHierarchyGraph.setNode(jsClass.id, jsClass);
    });
    // Second, connect the subclasses to superclasses in the graph
    jsClasses.forEach(jsClass => {
        if (jsClass.superclassId) {
            // As a bit of error checking, make sure that we're not going to
            // accidentally create a graph node by adding an edge to
            // jsClass.superclassId. This would happen if we didn't figure out
            // the correct path to the superclass in the parse phase, or we
            // didn't have the superclass's source file added to the project.
            if (!jsClassHierarchyGraph.hasNode(jsClass.superclassId)) {
                throw new Error(`
					correct-js-properties.ts: no JsClass exists for the 
					superclass identifier: '${jsClass.superclassId}'.
					Was processing JsClass '${jsClass.name}' from path '${jsClass.path}'.
					Make sure that the superclass's .js file is within the 
					directory passed to this conversion utility, or otherwise 
					there was a bug in creating the path/identifier to the superclass. 
				`.replace(/^\t*/gm, ''));
            }
            jsClassHierarchyGraph.setEdge(jsClass.id, jsClass.superclassId);
        }
    });
    // the topological sort is going to put superclasses later in the returned
    // array, so reverse it
    const superclassToSubclassOrder = graphlib_1.alg.topsort(jsClassHierarchyGraph).reverse();
    // Starting from superclass JsClass instances and walking down to subclass
    // JsClass instances, fill in the property sets. When a subclass is
    // encountered, take all of the properties that were used in that subclass,
    // minus the properties in its superclass, in order to determine the
    // subclass-specific properties
    superclassToSubclassOrder.forEach(jsClassId => {
        const jsClass = jsClassHierarchyGraph.node(jsClassId);
        const subclassOnlyProperties = new Set(jsClass.properties);
        const superclasses = getSuperclasses(jsClass);
        superclasses.forEach((superclass) => {
            // Filter out both properties and methods from each superclass
            superclass.members.forEach((superclassProp) => {
                subclassOnlyProperties.delete(superclassProp);
            });
        });
        const newJsClass = new js_class_1.JsClass({
            path: jsClass.path,
            name: jsClass.name,
            superclassName: jsClass.superclassName,
            superclassPath: jsClass.superclassPath,
            methods: jsClass.methods,
            properties: subclassOnlyProperties
        });
        // Re-assign the new JsClass with the correct subclass properties back
        // to the graph for the next iteration, in case there is a subclass of
        // the current class which needs to read those properties
        jsClassHierarchyGraph.setNode(jsClassId, newJsClass);
    });
    // Return all of the new JsClass instances with properties corrected for
    // superclass/subclasses
    return jsClassHierarchyGraph.nodes()
        .map(jsClassId => jsClassHierarchyGraph.node(jsClassId));
    function getSuperclasses(jsClass) {
        const superclasses = [];
        while (jsClass.superclassId) {
            const superclass = jsClassHierarchyGraph.node(jsClass.superclassId);
            superclasses.push(superclass);
            jsClass = superclass;
        }
        return superclasses;
    }
}
exports.correctJsProperties = correctJsProperties;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ycmVjdC1qcy1wcm9wZXJ0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnZlcnRlci9jb3JyZWN0LWpzLXByb3BlcnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBNEM7QUFDNUMsdUNBQXNDO0FBRXRDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ0gsNkJBQXFDLFNBQW9CO0lBQ3hELE1BQU0scUJBQXFCLEdBQUcsSUFBSSxnQkFBSyxFQUFFLENBQUM7SUFFMUMsb0NBQW9DO0lBQ3BDLFNBQVMsQ0FBQyxPQUFPLENBQUUsT0FBTyxDQUFDLEVBQUU7UUFDNUIscUJBQXFCLENBQUMsT0FBTyxDQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDdEQsQ0FBQyxDQUFFLENBQUM7SUFFSiw4REFBOEQ7SUFDOUQsU0FBUyxDQUFDLE9BQU8sQ0FBRSxPQUFPLENBQUMsRUFBRTtRQUM1QixJQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQUc7WUFDMUIsZ0VBQWdFO1lBQ2hFLHdEQUF3RDtZQUN4RCxrRUFBa0U7WUFDbEUsK0RBQStEO1lBQy9ELGlFQUFpRTtZQUNqRSxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUUsRUFBRztnQkFDNUQsTUFBTSxJQUFJLEtBQUssQ0FBRTs7K0JBRVUsT0FBTyxDQUFDLFlBQVk7K0JBQ3BCLE9BQU8sQ0FBQyxJQUFJLGdCQUFnQixPQUFPLENBQUMsSUFBSTs7OztLQUlsRSxDQUFDLE9BQU8sQ0FBRSxRQUFRLEVBQUUsRUFBRSxDQUFFLENBQUUsQ0FBQzthQUM1QjtZQUVELHFCQUFxQixDQUFDLE9BQU8sQ0FBRSxPQUFPLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUUsQ0FBQztTQUNsRTtJQUNGLENBQUMsQ0FBRSxDQUFDO0lBRUosMEVBQTBFO0lBQzFFLHVCQUF1QjtJQUN2QixNQUFNLHlCQUF5QixHQUFHLGNBQUcsQ0FBQyxPQUFPLENBQUUscUJBQXFCLENBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUVqRiwwRUFBMEU7SUFDMUUsbUVBQW1FO0lBQ25FLDJFQUEyRTtJQUMzRSxvRUFBb0U7SUFDcEUsK0JBQStCO0lBQy9CLHlCQUF5QixDQUFDLE9BQU8sQ0FBRSxTQUFTLENBQUMsRUFBRTtRQUM5QyxNQUFNLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUUsU0FBUyxDQUFhLENBQUM7UUFDbkUsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLEdBQUcsQ0FBVSxPQUFPLENBQUMsVUFBVSxDQUFFLENBQUM7UUFFckUsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFFLE9BQU8sQ0FBRSxDQUFDO1FBQ2hELFlBQVksQ0FBQyxPQUFPLENBQUUsQ0FBRSxVQUFtQixFQUFHLEVBQUU7WUFDL0MsOERBQThEO1lBQzlELFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFFLENBQUUsY0FBc0IsRUFBRyxFQUFFO2dCQUN4RCxzQkFBc0IsQ0FBQyxNQUFNLENBQUUsY0FBYyxDQUFFLENBQUM7WUFDakQsQ0FBQyxDQUFFLENBQUM7UUFDTCxDQUFDLENBQUUsQ0FBQztRQUVKLE1BQU0sVUFBVSxHQUFHLElBQUksa0JBQU8sQ0FBRTtZQUMvQixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7WUFDbEIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1lBQ2xCLGNBQWMsRUFBRSxPQUFPLENBQUMsY0FBYztZQUN0QyxjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7WUFDdEMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1lBQ3hCLFVBQVUsRUFBRSxzQkFBc0I7U0FDbEMsQ0FBRSxDQUFDO1FBRUosc0VBQXNFO1FBQ3RFLHNFQUFzRTtRQUN0RSx5REFBeUQ7UUFDekQscUJBQXFCLENBQUMsT0FBTyxDQUFFLFNBQVMsRUFBRSxVQUFVLENBQUUsQ0FBQztJQUN4RCxDQUFDLENBQUUsQ0FBQztJQUdKLHdFQUF3RTtJQUN4RSx3QkFBd0I7SUFDeEIsT0FBTyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUU7U0FDbEMsR0FBRyxDQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFFLFNBQVMsQ0FBYSxDQUFFLENBQUM7SUFHekUseUJBQTBCLE9BQWdCO1FBQ3pDLE1BQU0sWUFBWSxHQUFjLEVBQUUsQ0FBQztRQUVuQyxPQUFPLE9BQU8sQ0FBQyxZQUFZLEVBQUc7WUFDN0IsTUFBTSxVQUFVLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBQyxZQUFZLENBQWEsQ0FBQztZQUNqRixZQUFZLENBQUMsSUFBSSxDQUFFLFVBQVUsQ0FBRSxDQUFDO1lBRWhDLE9BQU8sR0FBRyxVQUFVLENBQUM7U0FDckI7UUFDRCxPQUFPLFlBQVksQ0FBQztJQUNyQixDQUFDO0FBQ0YsQ0FBQztBQXJGRCxrREFxRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBKc0NsYXNzIH0gZnJvbSBcIi4uL21vZGVsL2pzLWNsYXNzXCI7XG5pbXBvcnQgeyBHcmFwaCwgYWxnIH0gZnJvbSBcImdyYXBobGliXCI7XG5cbi8qKlxuICogQWZ0ZXIgdGhlIGdyYXBoIG9mIG9yaWdpbmFsIHtAbGluayBKc0NsYXNzfWVzIGFuZCB0aGVpciBwcm9wZXJ0aWVzIGhhdmUgYmVlblxuICogY3JlYXRlZCwgd2UgbmVlZCB0byByZW1vdmUgcHJvcGVydGllcyBmcm9tIHN1YmNsYXNzZXMgdGhhdCBhcmUgZGVmaW5lZCBpblxuICogdGhlaXIgc3VwZXJjbGFzc2VzLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gdGFrZXMgdGhlIG9yaWdpbmFsIGdyYXBoIG9mIGNsYXNzZXMgd2l0aCBhbGwgcHJvcGVydGllcyBpbiBlYWNoXG4gKiBjbGFzcyBhbmQgcmV0dXJucyBhIG5ldyBsaXN0IG9mIEpzQ2xhc3NlcyB3aXRoIHRoZSBwcm9wZXJ0aWVzIHByb3Blcmx5XG4gKiBmaWx0ZXJlZCBzbyB0aGF0IHN1YmNsYXNzZXMgZG8gbm90IGRlZmluZSB0aGUgc2FtZSBwcm9wZXJ0aWVzIHRoYXQgYXJlXG4gKiBhbHJlYWR5IHByZXNlbnQgaW4gdGhlaXIgc3VwZXJjbGFzc2VzLlxuICpcbiAqICMjIEFsZ29yaXRobVxuICpcbiAqIDEuIEJ1aWxkIGdyYXBoIG9mIHN1YmNsYXNzZXMgLT4gc3VwZXJjbGFzc2VzXG4gKiAyLiBUYWtlIHRvcG9sb2dpY2FsIHNvcnQgb2YgZ3JhcGhcbiAqIDMuIFN0YXJ0aW5nIGF0IHRoZSBzdXBlcmNsYXNzZXMgaW4gdGhlIHNvcnQsIGZpbGwgaW4gdGhlXG4gKiAgICBwcm9wZXJ0eVNldHMgZm9yIGVhY2ggSnNDbGFzcy4gRm9yIGV2ZXJ5IHN1YmNsYXNzIGVuY291bnRlcmVkLFxuICogICAgZmlsdGVyIG91dCBpdHMgc3VwZXJjbGFzcyBwcm9wZXJ0aWVzIHRvIGNyZWF0ZSB0aGUgc3ViY2xhc3MncyBwcm9wZXJ0eVxuICogICAgc2V0XG4gKiA0LiBVc2UgdGhlIHByb3BlcnR5U2V0cyB0byBjcmVhdGUgYSBuZXcgbGlzdCBvZiBKc0NsYXNzZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcnJlY3RKc1Byb3BlcnRpZXMoIGpzQ2xhc3NlczogSnNDbGFzc1tdICk6IEpzQ2xhc3NbXSB7XG5cdGNvbnN0IGpzQ2xhc3NIaWVyYXJjaHlHcmFwaCA9IG5ldyBHcmFwaCgpO1xuXG5cdC8vIEZpcnN0LCBhZGQgYWxsIG5vZGVzIHRvIHRoZSBncmFwaFxuXHRqc0NsYXNzZXMuZm9yRWFjaCgganNDbGFzcyA9PiB7XG5cdFx0anNDbGFzc0hpZXJhcmNoeUdyYXBoLnNldE5vZGUoIGpzQ2xhc3MuaWQsIGpzQ2xhc3MgKTtcblx0fSApO1xuXG5cdC8vIFNlY29uZCwgY29ubmVjdCB0aGUgc3ViY2xhc3NlcyB0byBzdXBlcmNsYXNzZXMgaW4gdGhlIGdyYXBoXG5cdGpzQ2xhc3Nlcy5mb3JFYWNoKCBqc0NsYXNzID0+IHtcblx0XHRpZigganNDbGFzcy5zdXBlcmNsYXNzSWQgKSB7XG5cdFx0XHQvLyBBcyBhIGJpdCBvZiBlcnJvciBjaGVja2luZywgbWFrZSBzdXJlIHRoYXQgd2UncmUgbm90IGdvaW5nIHRvXG5cdFx0XHQvLyBhY2NpZGVudGFsbHkgY3JlYXRlIGEgZ3JhcGggbm9kZSBieSBhZGRpbmcgYW4gZWRnZSB0b1xuXHRcdFx0Ly8ganNDbGFzcy5zdXBlcmNsYXNzSWQuIFRoaXMgd291bGQgaGFwcGVuIGlmIHdlIGRpZG4ndCBmaWd1cmUgb3V0XG5cdFx0XHQvLyB0aGUgY29ycmVjdCBwYXRoIHRvIHRoZSBzdXBlcmNsYXNzIGluIHRoZSBwYXJzZSBwaGFzZSwgb3Igd2Vcblx0XHRcdC8vIGRpZG4ndCBoYXZlIHRoZSBzdXBlcmNsYXNzJ3Mgc291cmNlIGZpbGUgYWRkZWQgdG8gdGhlIHByb2plY3QuXG5cdFx0XHRpZiggIWpzQ2xhc3NIaWVyYXJjaHlHcmFwaC5oYXNOb2RlKCBqc0NsYXNzLnN1cGVyY2xhc3NJZCApICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBcblx0XHRcdFx0XHRjb3JyZWN0LWpzLXByb3BlcnRpZXMudHM6IG5vIEpzQ2xhc3MgZXhpc3RzIGZvciB0aGUgXG5cdFx0XHRcdFx0c3VwZXJjbGFzcyBpZGVudGlmaWVyOiAnJHtqc0NsYXNzLnN1cGVyY2xhc3NJZH0nLlxuXHRcdFx0XHRcdFdhcyBwcm9jZXNzaW5nIEpzQ2xhc3MgJyR7anNDbGFzcy5uYW1lfScgZnJvbSBwYXRoICcke2pzQ2xhc3MucGF0aH0nLlxuXHRcdFx0XHRcdE1ha2Ugc3VyZSB0aGF0IHRoZSBzdXBlcmNsYXNzJ3MgLmpzIGZpbGUgaXMgd2l0aGluIHRoZSBcblx0XHRcdFx0XHRkaXJlY3RvcnkgcGFzc2VkIHRvIHRoaXMgY29udmVyc2lvbiB1dGlsaXR5LCBvciBvdGhlcndpc2UgXG5cdFx0XHRcdFx0dGhlcmUgd2FzIGEgYnVnIGluIGNyZWF0aW5nIHRoZSBwYXRoL2lkZW50aWZpZXIgdG8gdGhlIHN1cGVyY2xhc3MuIFxuXHRcdFx0XHRgLnJlcGxhY2UoIC9eXFx0Ki9nbSwgJycgKSApO1xuXHRcdFx0fVxuXG5cdFx0XHRqc0NsYXNzSGllcmFyY2h5R3JhcGguc2V0RWRnZSgganNDbGFzcy5pZCwganNDbGFzcy5zdXBlcmNsYXNzSWQgKTtcblx0XHR9XG5cdH0gKTtcblxuXHQvLyB0aGUgdG9wb2xvZ2ljYWwgc29ydCBpcyBnb2luZyB0byBwdXQgc3VwZXJjbGFzc2VzIGxhdGVyIGluIHRoZSByZXR1cm5lZFxuXHQvLyBhcnJheSwgc28gcmV2ZXJzZSBpdFxuXHRjb25zdCBzdXBlcmNsYXNzVG9TdWJjbGFzc09yZGVyID0gYWxnLnRvcHNvcnQoIGpzQ2xhc3NIaWVyYXJjaHlHcmFwaCApLnJldmVyc2UoKTtcblxuXHQvLyBTdGFydGluZyBmcm9tIHN1cGVyY2xhc3MgSnNDbGFzcyBpbnN0YW5jZXMgYW5kIHdhbGtpbmcgZG93biB0byBzdWJjbGFzc1xuXHQvLyBKc0NsYXNzIGluc3RhbmNlcywgZmlsbCBpbiB0aGUgcHJvcGVydHkgc2V0cy4gV2hlbiBhIHN1YmNsYXNzIGlzXG5cdC8vIGVuY291bnRlcmVkLCB0YWtlIGFsbCBvZiB0aGUgcHJvcGVydGllcyB0aGF0IHdlcmUgdXNlZCBpbiB0aGF0IHN1YmNsYXNzLFxuXHQvLyBtaW51cyB0aGUgcHJvcGVydGllcyBpbiBpdHMgc3VwZXJjbGFzcywgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHRoZVxuXHQvLyBzdWJjbGFzcy1zcGVjaWZpYyBwcm9wZXJ0aWVzXG5cdHN1cGVyY2xhc3NUb1N1YmNsYXNzT3JkZXIuZm9yRWFjaCgganNDbGFzc0lkID0+IHtcblx0XHRjb25zdCBqc0NsYXNzID0ganNDbGFzc0hpZXJhcmNoeUdyYXBoLm5vZGUoIGpzQ2xhc3NJZCApIGFzIEpzQ2xhc3M7XG5cdFx0Y29uc3Qgc3ViY2xhc3NPbmx5UHJvcGVydGllcyA9IG5ldyBTZXQ8c3RyaW5nPigganNDbGFzcy5wcm9wZXJ0aWVzICk7XG5cblx0XHRjb25zdCBzdXBlcmNsYXNzZXMgPSBnZXRTdXBlcmNsYXNzZXMoIGpzQ2xhc3MgKTtcblx0XHRzdXBlcmNsYXNzZXMuZm9yRWFjaCggKCBzdXBlcmNsYXNzOiBKc0NsYXNzICkgPT4ge1xuXHRcdFx0Ly8gRmlsdGVyIG91dCBib3RoIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMgZnJvbSBlYWNoIHN1cGVyY2xhc3Ncblx0XHRcdHN1cGVyY2xhc3MubWVtYmVycy5mb3JFYWNoKCAoIHN1cGVyY2xhc3NQcm9wOiBzdHJpbmcgKSA9PiB7XG5cdFx0XHRcdHN1YmNsYXNzT25seVByb3BlcnRpZXMuZGVsZXRlKCBzdXBlcmNsYXNzUHJvcCApO1xuXHRcdFx0fSApO1xuXHRcdH0gKTtcblxuXHRcdGNvbnN0IG5ld0pzQ2xhc3MgPSBuZXcgSnNDbGFzcygge1xuXHRcdFx0cGF0aDoganNDbGFzcy5wYXRoLFxuXHRcdFx0bmFtZToganNDbGFzcy5uYW1lLFxuXHRcdFx0c3VwZXJjbGFzc05hbWU6IGpzQ2xhc3Muc3VwZXJjbGFzc05hbWUsXG5cdFx0XHRzdXBlcmNsYXNzUGF0aDoganNDbGFzcy5zdXBlcmNsYXNzUGF0aCxcblx0XHRcdG1ldGhvZHM6IGpzQ2xhc3MubWV0aG9kcyxcblx0XHRcdHByb3BlcnRpZXM6IHN1YmNsYXNzT25seVByb3BlcnRpZXNcblx0XHR9ICk7XG5cblx0XHQvLyBSZS1hc3NpZ24gdGhlIG5ldyBKc0NsYXNzIHdpdGggdGhlIGNvcnJlY3Qgc3ViY2xhc3MgcHJvcGVydGllcyBiYWNrXG5cdFx0Ly8gdG8gdGhlIGdyYXBoIGZvciB0aGUgbmV4dCBpdGVyYXRpb24sIGluIGNhc2UgdGhlcmUgaXMgYSBzdWJjbGFzcyBvZlxuXHRcdC8vIHRoZSBjdXJyZW50IGNsYXNzIHdoaWNoIG5lZWRzIHRvIHJlYWQgdGhvc2UgcHJvcGVydGllc1xuXHRcdGpzQ2xhc3NIaWVyYXJjaHlHcmFwaC5zZXROb2RlKCBqc0NsYXNzSWQsIG5ld0pzQ2xhc3MgKTtcblx0fSApO1xuXG5cblx0Ly8gUmV0dXJuIGFsbCBvZiB0aGUgbmV3IEpzQ2xhc3MgaW5zdGFuY2VzIHdpdGggcHJvcGVydGllcyBjb3JyZWN0ZWQgZm9yXG5cdC8vIHN1cGVyY2xhc3Mvc3ViY2xhc3Nlc1xuXHRyZXR1cm4ganNDbGFzc0hpZXJhcmNoeUdyYXBoLm5vZGVzKClcblx0XHQubWFwKCBqc0NsYXNzSWQgPT4ganNDbGFzc0hpZXJhcmNoeUdyYXBoLm5vZGUoIGpzQ2xhc3NJZCApIGFzIEpzQ2xhc3MgKTtcblxuXG5cdGZ1bmN0aW9uIGdldFN1cGVyY2xhc3NlcygganNDbGFzczogSnNDbGFzcyApIHtcblx0XHRjb25zdCBzdXBlcmNsYXNzZXM6IEpzQ2xhc3NbXSA9IFtdO1xuXG5cdFx0d2hpbGUoIGpzQ2xhc3Muc3VwZXJjbGFzc0lkICkge1xuXHRcdFx0Y29uc3Qgc3VwZXJjbGFzcyA9IGpzQ2xhc3NIaWVyYXJjaHlHcmFwaC5ub2RlKCBqc0NsYXNzLnN1cGVyY2xhc3NJZCApIGFzIEpzQ2xhc3M7XG5cdFx0XHRzdXBlcmNsYXNzZXMucHVzaCggc3VwZXJjbGFzcyApO1xuXG5cdFx0XHRqc0NsYXNzID0gc3VwZXJjbGFzcztcblx0XHR9XG5cdFx0cmV0dXJuIHN1cGVyY2xhc3Nlcztcblx0fVxufSJdfQ==