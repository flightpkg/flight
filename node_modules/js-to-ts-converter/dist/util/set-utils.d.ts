/**
 * Unions two or more sets to create a combined set. Does not mutate the input
 * sets.
 */
export declare function union<T>(setA: Set<T>, ...sets: Set<T>[]): Set<T>;
/**
 * Removes the elements of `setB` from `setA` to produce the difference. Does
 * not mutate the input sets.
 */
export declare function difference<T>(setA: Set<T>, setB: Set<T>): Set<T>;
