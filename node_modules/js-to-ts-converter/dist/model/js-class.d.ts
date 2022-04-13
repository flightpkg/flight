/**
 * Represents a JavaScript class found in a source file.
 */
export declare class JsClass {
    readonly path: string;
    readonly name: string | undefined;
    readonly superclassName: string | undefined;
    readonly superclassPath: string | undefined;
    readonly methods: Set<string>;
    readonly properties: Set<string>;
    readonly members: Set<string>;
    constructor(cfg: {
        path: string;
        name: string | undefined;
        superclassName: string | undefined;
        superclassPath: string | undefined;
        methods: Set<string>;
        properties: Set<string>;
    });
    /**
     * String identifier for the JsClass which is a combination of its file path
     * and class name. Used to store JsClass nodes on a graphlib Graph.
     */
    readonly id: string;
    /**
     * Retrieves the ID of the superclass JsClass instance, if the JsClass has
     * one. If not, returns undefined.
     */
    readonly superclassId: string | undefined;
    /**
     * Determines if the JsClass's superclass was found in the node_modules
     * directory (i.e. it extends from another package).
     *
     * If so, we're not going to try to understand a possibly ES5 module for
     * its properties, so we'll just stop processing at that point.
     */
    isSuperclassInNodeModules(): boolean;
}
