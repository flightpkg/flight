/**
 * Represents a JavaScript class found in a source file.
 */
export declare class JsClass {
    /**
     * The name of the class.
     *
     * Will be undefined for a default export class.
     */
    readonly name: string | undefined;
    /**
     * The absolute path of the file that the class was found in.
     */
    readonly path: string;
    /**
     * The name of this class's superclass. Will be `undefined` if the class
     * does not have a superclass.
     */
    readonly superclassName: string | undefined;
    /**
     * The path to the file which holds this class's superclass. If the same
     * file that holds this class also holds its superclass, this will be the
     * same value as the {@link #path}.
     *
     * Will be `undefined` if the superclass was found in the node_modules
     * folder. We don't try to resolve the path of a module that exists in the
     * node_modules folder as they're not relevant to this conversion utility,
     * and we want to allow conversions of codebases that don't have
     * node_modules installed (which can really improve performance as
     * ts-morph doesn't try to resolve them when it finds imports in .ts
     * files)
     */
    readonly superclassPath: string | undefined;
    /**
     * The set of methods found in the class.
     */
    readonly methods: Set<string>;
    /**
     * The set of properties found to be used in the class. These are inferred
     * from usages. For example: console.log(this.something) would tell us that
     * the class has a property `something`
     */
    readonly properties: Set<string>;
    /**
     * A union of the {@link #methods} and {@link #properties} sets
     */
    readonly members: Set<string>;
    constructor(cfg: {
        name: string | undefined;
        path: string;
        superclassName: string | undefined;
        superclassPath: string | undefined;
        methods?: Set<string>;
        properties?: Set<string>;
    });
    /**
     * String identifier for the JsClass which is a combination of its file path
     * and class name. Used to store JsClass nodes on a graphlib Graph.
     */
    get id(): string;
    /**
     * Retrieves the ID of the superclass JsClass instance, if the JsClass has
     * one. If not, returns undefined.
     *
     * Also returns `undefined` if the class is found to be in the node_modules
     * folder, as we don't want to attempt to parse ES5 modules.
     */
    get superclassId(): string | undefined;
    /**
     * Determines if the JsClass's superclass was found in the node_modules
     * directory (i.e. it extends from another package).
     *
     * If so, we're not going to try to understand a possibly ES5 module for
     * its properties, so we'll just stop processing at that point.
     */
    isSuperclassInNodeModules(): boolean;
}
