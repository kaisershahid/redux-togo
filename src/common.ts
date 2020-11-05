export type AnyMap = {[key: string]: any};

export type TypedMap<T> = {[key: string]: T};

/**
 * Splits an action into parts on the `/` delimiter.
 * @param action
 */
export const splitAction = (action: string): string[] => {
    return action.split('/');
}