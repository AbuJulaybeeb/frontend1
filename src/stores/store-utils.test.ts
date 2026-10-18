import { describe, it, expect, beforeEach } from 'vitest';
import { createPersistedStore, makeResetAction } from './store-utils';

// ---------------------------------------------------------------------------
// createPersistedStore
// ---------------------------------------------------------------------------

interface CounterStore {
  count: number;
  increment: () => void;
}

const useCounterStore = createPersistedStore<CounterStore>(
  (set) => ({
    count: 0,
    increment: () => set((s) => ({ count: s.count + 1 })),
  }),
  { name: 'test-counter-store' }
);

describe('createPersistedStore', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 });
  });

  it('initialises state from the creator', () => {
    expect(useCounterStore.getState().count).toBe(0);
  });

  it('state mutations work as expected', () => {
    useCounterStore.getState().increment();
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(2);
  });

  it('returns a store that exposes getState and setState', () => {
    expect(typeof useCounterStore.getState).toBe('function');
    expect(typeof useCounterStore.setState).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// makeResetAction
// ---------------------------------------------------------------------------

interface ProfileStore {
  name: string;
  age: number;
  resetState: () => void;
}

const PROFILE_INITIAL = { name: 'Alice', age: 30 };

const useProfileStore = createPersistedStore<ProfileStore>(
  (set) => ({
    ...PROFILE_INITIAL,
    resetState: makeResetAction<ProfileStore>(set, {
      ...PROFILE_INITIAL,
      resetState: () => {},
    }),
  }),
  { name: 'test-profile-store' }
);

describe('makeResetAction', () => {
  beforeEach(() => {
    useProfileStore.setState({ ...PROFILE_INITIAL });
  });

  it('restores all state fields to their initial values', () => {
    useProfileStore.setState({ name: 'Bob', age: 99 });
    expect(useProfileStore.getState().name).toBe('Bob');

    useProfileStore.getState().resetState();

    expect(useProfileStore.getState().name).toBe('Alice');
    expect(useProfileStore.getState().age).toBe(30);
  });

  it('does not affect unrelated stores', () => {
    useCounterStore.getState().increment();
    useProfileStore.getState().resetState();
    expect(useCounterStore.getState().count).toBe(1);
  });
});
