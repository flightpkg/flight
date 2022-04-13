"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctJsProperties = void 0;
const js_class_1 = require("./js-class");
const graphlib_1 = require("graphlib");
const logger_1 = __importDefault(require("../../logger/logger"));
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
    logger_1.default.debug('Building graph of class hierarchy to determine which class properties belong to superclasses/subclasses');
    const jsClassHierarchyGraph = new graphlib_1.Graph();
    // First, add all nodes to the graph
    jsClasses.forEach(jsClass => {
        jsClassHierarchyGraph.setNode(jsClass.id, jsClass);
    });
    // Second, connect the subclasses to superclasses in the graph
    jsClasses.forEach(jsClass => {
        if (jsClass.superclassId) {
            // If we come across a JsClass whose superclass is in the node_modules
            // directory (i.e. imported from another package), do not try to
            // go into that package. We're not going to try to understand an ES5
            // module
            if (jsClass.isSuperclassInNodeModules()) {
                return;
            }
            // As a bit of error checking, make sure that we're not going to
            // accidentally create a graph node by adding an edge to
            // jsClass.superclassId. This would happen if we didn't figure out
            // the correct path to the superclass in the parse phase, or we
            // didn't have the superclass's source file added to the project.
            if (!jsClassHierarchyGraph.hasNode(jsClass.superclassId)) {
                throw new Error(`
					An error occurred while adding property declarations to class
					'${jsClass.name}' in file:
					    '${jsClass.path}'
					
					Did not parse this class's superclass ('${jsClass.superclassName}') from file:
					    '${jsClass.superclassPath}'
					during the parse phase. 
					
					Make sure that this class's superclass's .js file is within the 
					directory passed to this conversion utility, or otherwise 
					there is a bug in this utility. Please report at:
					    https://github.com/gregjacobs/js-to-ts-converter/issues
					 
					Debugging info:
					
					This class's graph ID: ${jsClass.id}
					It's superclass's graph ID: ${jsClass.superclassId}
					
					Current IDs in the graph:
					    ${jsClassHierarchyGraph.nodes().join('\n    ')}
				`.replace(/^\t*/gm, ''));
            }
            jsClassHierarchyGraph.setEdge(jsClass.id, jsClass.superclassId);
        }
    });
    // the topological sort is going to put superclasses later in the returned
    // array, so reverse it
    logger_1.default.debug('Topologically sorting the graph in superclass->subclass order');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ycmVjdC1qcy1wcm9wZXJ0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnZlcnRlci9hZGQtY2xhc3MtcHJvcGVydHktZGVjbGFyYXRpb25zL2NvcnJlY3QtanMtcHJvcGVydGllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx5Q0FBcUM7QUFDckMsdUNBQXNDO0FBQ3RDLGlFQUF5QztBQUV6Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNILFNBQWdCLG1CQUFtQixDQUFFLFNBQW9CO0lBQ3hELGdCQUFNLENBQUMsS0FBSyxDQUFFLHlHQUF5RyxDQUFFLENBQUM7SUFFMUgsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLGdCQUFLLEVBQUUsQ0FBQztJQUUxQyxvQ0FBb0M7SUFDcEMsU0FBUyxDQUFDLE9BQU8sQ0FBRSxPQUFPLENBQUMsRUFBRTtRQUM1QixxQkFBcUIsQ0FBQyxPQUFPLENBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUUsQ0FBQztJQUN0RCxDQUFDLENBQUUsQ0FBQztJQUVKLDhEQUE4RDtJQUM5RCxTQUFTLENBQUMsT0FBTyxDQUFFLE9BQU8sQ0FBQyxFQUFFO1FBQzVCLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRztZQUMxQixzRUFBc0U7WUFDdEUsZ0VBQWdFO1lBQ2hFLG9FQUFvRTtZQUNwRSxTQUFTO1lBQ1QsSUFBSSxPQUFPLENBQUMseUJBQXlCLEVBQUUsRUFBRztnQkFDekMsT0FBTzthQUNQO1lBRUQsZ0VBQWdFO1lBQ2hFLHdEQUF3RDtZQUN4RCxrRUFBa0U7WUFDbEUsK0RBQStEO1lBQy9ELGlFQUFpRTtZQUNqRSxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUUsRUFBRztnQkFDNUQsTUFBTSxJQUFJLEtBQUssQ0FBRTs7UUFFYixPQUFPLENBQUMsSUFBSTtZQUNSLE9BQU8sQ0FBQyxJQUFJOzsrQ0FFdUIsT0FBTyxDQUFDLGNBQWM7WUFDekQsT0FBTyxDQUFDLGNBQWM7Ozs7Ozs7Ozs7OEJBVUosT0FBTyxDQUFDLEVBQUU7bUNBQ0wsT0FBTyxDQUFDLFlBQVk7OztXQUc1QyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUUsUUFBUSxDQUFFO0tBQ3BELENBQUMsT0FBTyxDQUFFLFFBQVEsRUFBRSxFQUFFLENBQUUsQ0FBRSxDQUFDO2FBQzVCO1lBRUQscUJBQXFCLENBQUMsT0FBTyxDQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBRSxDQUFDO1NBQ2xFO0lBQ0YsQ0FBQyxDQUFFLENBQUM7SUFFSiwwRUFBMEU7SUFDMUUsdUJBQXVCO0lBQ3ZCLGdCQUFNLENBQUMsS0FBSyxDQUFFLCtEQUErRCxDQUFFLENBQUM7SUFDaEYsTUFBTSx5QkFBeUIsR0FBRyxjQUFHLENBQUMsT0FBTyxDQUFFLHFCQUFxQixDQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7SUFFakYsMEVBQTBFO0lBQzFFLG1FQUFtRTtJQUNuRSwyRUFBMkU7SUFDM0Usb0VBQW9FO0lBQ3BFLCtCQUErQjtJQUMvQix5QkFBeUIsQ0FBQyxPQUFPLENBQUUsU0FBUyxDQUFDLEVBQUU7UUFDOUMsTUFBTSxPQUFPLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFFLFNBQVMsQ0FBYSxDQUFDO1FBQ25FLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxHQUFHLENBQVUsT0FBTyxDQUFDLFVBQVUsQ0FBRSxDQUFDO1FBRXJFLE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBRSxPQUFPLENBQUUsQ0FBQztRQUNoRCxZQUFZLENBQUMsT0FBTyxDQUFFLENBQUUsVUFBbUIsRUFBRyxFQUFFO1lBQy9DLDhEQUE4RDtZQUM5RCxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBRSxDQUFFLGNBQXNCLEVBQUcsRUFBRTtnQkFDeEQsc0JBQXNCLENBQUMsTUFBTSxDQUFFLGNBQWMsQ0FBRSxDQUFDO1lBQ2pELENBQUMsQ0FBRSxDQUFDO1FBQ0wsQ0FBQyxDQUFFLENBQUM7UUFFSixNQUFNLFVBQVUsR0FBRyxJQUFJLGtCQUFPLENBQUU7WUFDL0IsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1lBQ2xCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNsQixjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7WUFDdEMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjO1lBQ3RDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztZQUN4QixVQUFVLEVBQUUsc0JBQXNCO1NBQ2xDLENBQUUsQ0FBQztRQUVKLHNFQUFzRTtRQUN0RSxzRUFBc0U7UUFDdEUseURBQXlEO1FBQ3pELHFCQUFxQixDQUFDLE9BQU8sQ0FBRSxTQUFTLEVBQUUsVUFBVSxDQUFFLENBQUM7SUFDeEQsQ0FBQyxDQUFFLENBQUM7SUFHSix3RUFBd0U7SUFDeEUsd0JBQXdCO0lBQ3hCLE9BQU8scUJBQXFCLENBQUMsS0FBSyxFQUFFO1NBQ2xDLEdBQUcsQ0FBRSxTQUFTLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBRSxTQUFTLENBQWEsQ0FBRSxDQUFDO0lBR3pFLFNBQVMsZUFBZSxDQUFFLE9BQWdCO1FBQ3pDLE1BQU0sWUFBWSxHQUFjLEVBQUUsQ0FBQztRQUVuQyxPQUFPLE9BQU8sQ0FBQyxZQUFZLEVBQUc7WUFDN0IsTUFBTSxVQUFVLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBQyxZQUFZLENBQWEsQ0FBQztZQUNqRixZQUFZLENBQUMsSUFBSSxDQUFFLFVBQVUsQ0FBRSxDQUFDO1lBRWhDLE9BQU8sR0FBRyxVQUFVLENBQUM7U0FDckI7UUFDRCxPQUFPLFlBQVksQ0FBQztJQUNyQixDQUFDO0FBQ0YsQ0FBQztBQTlHRCxrREE4R0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBKc0NsYXNzIH0gZnJvbSBcIi4vanMtY2xhc3NcIjtcbmltcG9ydCB7IEdyYXBoLCBhbGcgfSBmcm9tIFwiZ3JhcGhsaWJcIjtcbmltcG9ydCBsb2dnZXIgZnJvbSBcIi4uLy4uL2xvZ2dlci9sb2dnZXJcIjtcblxuLyoqXG4gKiBBZnRlciB0aGUgZ3JhcGggb2Ygb3JpZ2luYWwge0BsaW5rIEpzQ2xhc3N9ZXMgYW5kIHRoZWlyIHByb3BlcnRpZXMgaGF2ZSBiZWVuXG4gKiBjcmVhdGVkLCB3ZSBuZWVkIHRvIHJlbW92ZSBwcm9wZXJ0aWVzIGZyb20gc3ViY2xhc3NlcyB0aGF0IGFyZSBkZWZpbmVkIGluXG4gKiB0aGVpciBzdXBlcmNsYXNzZXMuXG4gKlxuICogVGhpcyBmdW5jdGlvbiB0YWtlcyB0aGUgb3JpZ2luYWwgZ3JhcGggb2YgY2xhc3NlcyB3aXRoIGFsbCBwcm9wZXJ0aWVzIGluIGVhY2hcbiAqIGNsYXNzIGFuZCByZXR1cm5zIGEgbmV3IGxpc3Qgb2YgSnNDbGFzc2VzIHdpdGggdGhlIHByb3BlcnRpZXMgcHJvcGVybHlcbiAqIGZpbHRlcmVkIHNvIHRoYXQgc3ViY2xhc3NlcyBkbyBub3QgZGVmaW5lIHRoZSBzYW1lIHByb3BlcnRpZXMgdGhhdCBhcmVcbiAqIGFscmVhZHkgcHJlc2VudCBpbiB0aGVpciBzdXBlcmNsYXNzZXMuXG4gKlxuICogIyMgQWxnb3JpdGhtXG4gKlxuICogMS4gQnVpbGQgZ3JhcGggb2Ygc3ViY2xhc3NlcyAtPiBzdXBlcmNsYXNzZXNcbiAqIDIuIFRha2UgdG9wb2xvZ2ljYWwgc29ydCBvZiBncmFwaFxuICogMy4gU3RhcnRpbmcgYXQgdGhlIHN1cGVyY2xhc3NlcyBpbiB0aGUgc29ydCwgZmlsbCBpbiB0aGVcbiAqICAgIHByb3BlcnR5U2V0cyBmb3IgZWFjaCBKc0NsYXNzLiBGb3IgZXZlcnkgc3ViY2xhc3MgZW5jb3VudGVyZWQsXG4gKiAgICBmaWx0ZXIgb3V0IGl0cyBzdXBlcmNsYXNzIHByb3BlcnRpZXMgdG8gY3JlYXRlIHRoZSBzdWJjbGFzcydzIHByb3BlcnR5XG4gKiAgICBzZXRcbiAqIDQuIFVzZSB0aGUgcHJvcGVydHlTZXRzIHRvIGNyZWF0ZSBhIG5ldyBsaXN0IG9mIEpzQ2xhc3Nlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29ycmVjdEpzUHJvcGVydGllcygganNDbGFzc2VzOiBKc0NsYXNzW10gKTogSnNDbGFzc1tdIHtcblx0bG9nZ2VyLmRlYnVnKCAnQnVpbGRpbmcgZ3JhcGggb2YgY2xhc3MgaGllcmFyY2h5IHRvIGRldGVybWluZSB3aGljaCBjbGFzcyBwcm9wZXJ0aWVzIGJlbG9uZyB0byBzdXBlcmNsYXNzZXMvc3ViY2xhc3NlcycgKTtcblxuXHRjb25zdCBqc0NsYXNzSGllcmFyY2h5R3JhcGggPSBuZXcgR3JhcGgoKTtcblxuXHQvLyBGaXJzdCwgYWRkIGFsbCBub2RlcyB0byB0aGUgZ3JhcGhcblx0anNDbGFzc2VzLmZvckVhY2goIGpzQ2xhc3MgPT4ge1xuXHRcdGpzQ2xhc3NIaWVyYXJjaHlHcmFwaC5zZXROb2RlKCBqc0NsYXNzLmlkLCBqc0NsYXNzICk7XG5cdH0gKTtcblxuXHQvLyBTZWNvbmQsIGNvbm5lY3QgdGhlIHN1YmNsYXNzZXMgdG8gc3VwZXJjbGFzc2VzIGluIHRoZSBncmFwaFxuXHRqc0NsYXNzZXMuZm9yRWFjaCgganNDbGFzcyA9PiB7XG5cdFx0aWYoIGpzQ2xhc3Muc3VwZXJjbGFzc0lkICkge1xuXHRcdFx0Ly8gSWYgd2UgY29tZSBhY3Jvc3MgYSBKc0NsYXNzIHdob3NlIHN1cGVyY2xhc3MgaXMgaW4gdGhlIG5vZGVfbW9kdWxlc1xuXHRcdFx0Ly8gZGlyZWN0b3J5IChpLmUuIGltcG9ydGVkIGZyb20gYW5vdGhlciBwYWNrYWdlKSwgZG8gbm90IHRyeSB0b1xuXHRcdFx0Ly8gZ28gaW50byB0aGF0IHBhY2thZ2UuIFdlJ3JlIG5vdCBnb2luZyB0byB0cnkgdG8gdW5kZXJzdGFuZCBhbiBFUzVcblx0XHRcdC8vIG1vZHVsZVxuXHRcdFx0aWYoIGpzQ2xhc3MuaXNTdXBlcmNsYXNzSW5Ob2RlTW9kdWxlcygpICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIEFzIGEgYml0IG9mIGVycm9yIGNoZWNraW5nLCBtYWtlIHN1cmUgdGhhdCB3ZSdyZSBub3QgZ29pbmcgdG9cblx0XHRcdC8vIGFjY2lkZW50YWxseSBjcmVhdGUgYSBncmFwaCBub2RlIGJ5IGFkZGluZyBhbiBlZGdlIHRvXG5cdFx0XHQvLyBqc0NsYXNzLnN1cGVyY2xhc3NJZC4gVGhpcyB3b3VsZCBoYXBwZW4gaWYgd2UgZGlkbid0IGZpZ3VyZSBvdXRcblx0XHRcdC8vIHRoZSBjb3JyZWN0IHBhdGggdG8gdGhlIHN1cGVyY2xhc3MgaW4gdGhlIHBhcnNlIHBoYXNlLCBvciB3ZVxuXHRcdFx0Ly8gZGlkbid0IGhhdmUgdGhlIHN1cGVyY2xhc3MncyBzb3VyY2UgZmlsZSBhZGRlZCB0byB0aGUgcHJvamVjdC5cblx0XHRcdGlmKCAhanNDbGFzc0hpZXJhcmNoeUdyYXBoLmhhc05vZGUoIGpzQ2xhc3Muc3VwZXJjbGFzc0lkICkgKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggYFxuXHRcdFx0XHRcdEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGFkZGluZyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgdG8gY2xhc3Ncblx0XHRcdFx0XHQnJHtqc0NsYXNzLm5hbWV9JyBpbiBmaWxlOlxuXHRcdFx0XHRcdCAgICAnJHtqc0NsYXNzLnBhdGh9J1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdERpZCBub3QgcGFyc2UgdGhpcyBjbGFzcydzIHN1cGVyY2xhc3MgKCcke2pzQ2xhc3Muc3VwZXJjbGFzc05hbWV9JykgZnJvbSBmaWxlOlxuXHRcdFx0XHRcdCAgICAnJHtqc0NsYXNzLnN1cGVyY2xhc3NQYXRofSdcblx0XHRcdFx0XHRkdXJpbmcgdGhlIHBhcnNlIHBoYXNlLiBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRNYWtlIHN1cmUgdGhhdCB0aGlzIGNsYXNzJ3Mgc3VwZXJjbGFzcydzIC5qcyBmaWxlIGlzIHdpdGhpbiB0aGUgXG5cdFx0XHRcdFx0ZGlyZWN0b3J5IHBhc3NlZCB0byB0aGlzIGNvbnZlcnNpb24gdXRpbGl0eSwgb3Igb3RoZXJ3aXNlIFxuXHRcdFx0XHRcdHRoZXJlIGlzIGEgYnVnIGluIHRoaXMgdXRpbGl0eS4gUGxlYXNlIHJlcG9ydCBhdDpcblx0XHRcdFx0XHQgICAgaHR0cHM6Ly9naXRodWIuY29tL2dyZWdqYWNvYnMvanMtdG8tdHMtY29udmVydGVyL2lzc3Vlc1xuXHRcdFx0XHRcdCBcblx0XHRcdFx0XHREZWJ1Z2dpbmcgaW5mbzpcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRUaGlzIGNsYXNzJ3MgZ3JhcGggSUQ6ICR7anNDbGFzcy5pZH1cblx0XHRcdFx0XHRJdCdzIHN1cGVyY2xhc3MncyBncmFwaCBJRDogJHtqc0NsYXNzLnN1cGVyY2xhc3NJZH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRDdXJyZW50IElEcyBpbiB0aGUgZ3JhcGg6XG5cdFx0XHRcdFx0ICAgICR7anNDbGFzc0hpZXJhcmNoeUdyYXBoLm5vZGVzKCkuam9pbiggJ1xcbiAgICAnICl9XG5cdFx0XHRcdGAucmVwbGFjZSggL15cXHQqL2dtLCAnJyApICk7XG5cdFx0XHR9XG5cblx0XHRcdGpzQ2xhc3NIaWVyYXJjaHlHcmFwaC5zZXRFZGdlKCBqc0NsYXNzLmlkLCBqc0NsYXNzLnN1cGVyY2xhc3NJZCApO1xuXHRcdH1cblx0fSApO1xuXG5cdC8vIHRoZSB0b3BvbG9naWNhbCBzb3J0IGlzIGdvaW5nIHRvIHB1dCBzdXBlcmNsYXNzZXMgbGF0ZXIgaW4gdGhlIHJldHVybmVkXG5cdC8vIGFycmF5LCBzbyByZXZlcnNlIGl0XG5cdGxvZ2dlci5kZWJ1ZyggJ1RvcG9sb2dpY2FsbHkgc29ydGluZyB0aGUgZ3JhcGggaW4gc3VwZXJjbGFzcy0+c3ViY2xhc3Mgb3JkZXInICk7XG5cdGNvbnN0IHN1cGVyY2xhc3NUb1N1YmNsYXNzT3JkZXIgPSBhbGcudG9wc29ydCgganNDbGFzc0hpZXJhcmNoeUdyYXBoICkucmV2ZXJzZSgpO1xuXG5cdC8vIFN0YXJ0aW5nIGZyb20gc3VwZXJjbGFzcyBKc0NsYXNzIGluc3RhbmNlcyBhbmQgd2Fsa2luZyBkb3duIHRvIHN1YmNsYXNzXG5cdC8vIEpzQ2xhc3MgaW5zdGFuY2VzLCBmaWxsIGluIHRoZSBwcm9wZXJ0eSBzZXRzLiBXaGVuIGEgc3ViY2xhc3MgaXNcblx0Ly8gZW5jb3VudGVyZWQsIHRha2UgYWxsIG9mIHRoZSBwcm9wZXJ0aWVzIHRoYXQgd2VyZSB1c2VkIGluIHRoYXQgc3ViY2xhc3MsXG5cdC8vIG1pbnVzIHRoZSBwcm9wZXJ0aWVzIGluIGl0cyBzdXBlcmNsYXNzLCBpbiBvcmRlciB0byBkZXRlcm1pbmUgdGhlXG5cdC8vIHN1YmNsYXNzLXNwZWNpZmljIHByb3BlcnRpZXNcblx0c3VwZXJjbGFzc1RvU3ViY2xhc3NPcmRlci5mb3JFYWNoKCBqc0NsYXNzSWQgPT4ge1xuXHRcdGNvbnN0IGpzQ2xhc3MgPSBqc0NsYXNzSGllcmFyY2h5R3JhcGgubm9kZSgganNDbGFzc0lkICkgYXMgSnNDbGFzcztcblx0XHRjb25zdCBzdWJjbGFzc09ubHlQcm9wZXJ0aWVzID0gbmV3IFNldDxzdHJpbmc+KCBqc0NsYXNzLnByb3BlcnRpZXMgKTtcblxuXHRcdGNvbnN0IHN1cGVyY2xhc3NlcyA9IGdldFN1cGVyY2xhc3NlcygganNDbGFzcyApO1xuXHRcdHN1cGVyY2xhc3Nlcy5mb3JFYWNoKCAoIHN1cGVyY2xhc3M6IEpzQ2xhc3MgKSA9PiB7XG5cdFx0XHQvLyBGaWx0ZXIgb3V0IGJvdGggcHJvcGVydGllcyBhbmQgbWV0aG9kcyBmcm9tIGVhY2ggc3VwZXJjbGFzc1xuXHRcdFx0c3VwZXJjbGFzcy5tZW1iZXJzLmZvckVhY2goICggc3VwZXJjbGFzc1Byb3A6IHN0cmluZyApID0+IHtcblx0XHRcdFx0c3ViY2xhc3NPbmx5UHJvcGVydGllcy5kZWxldGUoIHN1cGVyY2xhc3NQcm9wICk7XG5cdFx0XHR9ICk7XG5cdFx0fSApO1xuXG5cdFx0Y29uc3QgbmV3SnNDbGFzcyA9IG5ldyBKc0NsYXNzKCB7XG5cdFx0XHRwYXRoOiBqc0NsYXNzLnBhdGgsXG5cdFx0XHRuYW1lOiBqc0NsYXNzLm5hbWUsXG5cdFx0XHRzdXBlcmNsYXNzTmFtZToganNDbGFzcy5zdXBlcmNsYXNzTmFtZSxcblx0XHRcdHN1cGVyY2xhc3NQYXRoOiBqc0NsYXNzLnN1cGVyY2xhc3NQYXRoLFxuXHRcdFx0bWV0aG9kczoganNDbGFzcy5tZXRob2RzLFxuXHRcdFx0cHJvcGVydGllczogc3ViY2xhc3NPbmx5UHJvcGVydGllc1xuXHRcdH0gKTtcblxuXHRcdC8vIFJlLWFzc2lnbiB0aGUgbmV3IEpzQ2xhc3Mgd2l0aCB0aGUgY29ycmVjdCBzdWJjbGFzcyBwcm9wZXJ0aWVzIGJhY2tcblx0XHQvLyB0byB0aGUgZ3JhcGggZm9yIHRoZSBuZXh0IGl0ZXJhdGlvbiwgaW4gY2FzZSB0aGVyZSBpcyBhIHN1YmNsYXNzIG9mXG5cdFx0Ly8gdGhlIGN1cnJlbnQgY2xhc3Mgd2hpY2ggbmVlZHMgdG8gcmVhZCB0aG9zZSBwcm9wZXJ0aWVzXG5cdFx0anNDbGFzc0hpZXJhcmNoeUdyYXBoLnNldE5vZGUoIGpzQ2xhc3NJZCwgbmV3SnNDbGFzcyApO1xuXHR9ICk7XG5cblxuXHQvLyBSZXR1cm4gYWxsIG9mIHRoZSBuZXcgSnNDbGFzcyBpbnN0YW5jZXMgd2l0aCBwcm9wZXJ0aWVzIGNvcnJlY3RlZCBmb3Jcblx0Ly8gc3VwZXJjbGFzcy9zdWJjbGFzc2VzXG5cdHJldHVybiBqc0NsYXNzSGllcmFyY2h5R3JhcGgubm9kZXMoKVxuXHRcdC5tYXAoIGpzQ2xhc3NJZCA9PiBqc0NsYXNzSGllcmFyY2h5R3JhcGgubm9kZSgganNDbGFzc0lkICkgYXMgSnNDbGFzcyApO1xuXG5cblx0ZnVuY3Rpb24gZ2V0U3VwZXJjbGFzc2VzKCBqc0NsYXNzOiBKc0NsYXNzICkge1xuXHRcdGNvbnN0IHN1cGVyY2xhc3NlczogSnNDbGFzc1tdID0gW107XG5cblx0XHR3aGlsZSgganNDbGFzcy5zdXBlcmNsYXNzSWQgKSB7XG5cdFx0XHRjb25zdCBzdXBlcmNsYXNzID0ganNDbGFzc0hpZXJhcmNoeUdyYXBoLm5vZGUoIGpzQ2xhc3Muc3VwZXJjbGFzc0lkICkgYXMgSnNDbGFzcztcblx0XHRcdHN1cGVyY2xhc3Nlcy5wdXNoKCBzdXBlcmNsYXNzICk7XG5cblx0XHRcdGpzQ2xhc3MgPSBzdXBlcmNsYXNzO1xuXHRcdH1cblx0XHRyZXR1cm4gc3VwZXJjbGFzc2VzO1xuXHR9XG59Il19