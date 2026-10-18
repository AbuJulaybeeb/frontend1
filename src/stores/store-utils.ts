import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import type { PersistOptions } from 'zustand/middleware';

/**
 * Wraps the repeated `create<T>()(persist(stateCreator, options))` boilerplate
 * shared by every store in this directory into a single call.
 *
 * Usage:
 *   export const useMyStore = createPersistedStore<MyStore>(
 *     (set, get) => ({ ... }),
 *     { name: 'dorisio-my-store' }
 *   );
 */
export function createPersistedStore<T>(
  stateCreator: StateCreator<T, [['zustand/persist', unknown]], []>,
  options: PersistOptions<T>
) {
  return create<T>()(persist(stateCreator, options));
}

/**
 * Returns a `resetState` action that restores all keys in the store slice to
 * their initial values. Avoids spelling out the initial state a second time
 * inside the reset action.
 *
 * Usage inside a stateCreator:
 *   const initial = { count: 0, name: '' };
 *   (set) => ({
 *     ...initial,
 *     resetState: makeResetAction(set, initial),
 *   })
 */
export function makeResetAction<T extends object>(
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
  initial: T
): () => void {
  return () => set(initial);
}
