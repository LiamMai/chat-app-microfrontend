import { useCallback, useReducer, useRef } from 'react';

type SetAction<S> = Partial<S> | ((prev: S) => Partial<S>);

function shallowEqual<T extends object>(a: T, b: T): boolean {
  const keysA = Object.keys(a) as (keyof T)[];
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every((k) => Object.is(a[k], b[k]));
}

function reducer<S extends object>(state: S, patch: Partial<S>): S {
  const next = { ...state, ...patch };
  return shallowEqual(state, next) ? state : next;
}

/**
 * Drop-in for many useState calls. Merges partial updates, skips re-render
 * when shallow-equal values are set.
 *
 * Usage:
 *   const [state, setState] = useStableState({ name: '', age: 0, loading: false });
 *   setState({ loading: true });                    // partial update
 *   setState(prev => ({ count: prev.count + 1 }));  // functional update
 */
export function useStableState<S extends object>(initialState: S | (() => S)) {
  const init = typeof initialState === 'function' ? (initialState as () => S)() : initialState;
  const [state, dispatch] = useReducer(reducer<S>, init);
  const stateRef = useRef(state);
  stateRef.current = state;

  const setState = useCallback((action: SetAction<S>) => {
    const patch = typeof action === 'function' ? action(stateRef.current) : action;
    dispatch(patch);
  }, []);

  return [state, setState] as const;
}
