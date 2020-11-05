export declare type AnyMap = {
    [key: string]: any;
};
export declare type TypedMap<T> = {
    [key: string]: T;
};
/**
 * Splits an action into parts on the `/` delimiter.
 * @param action
 */
export declare const splitAction: (action: string) => string[];
