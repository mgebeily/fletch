import { createStore } from '.';

describe('createStore', () => {
  it('sets an empty default store', () => {
    const fletch = createStore();

    const state = fletch.retrieve('/');

    expect(state).toEqual({});
  });

  it('accepts a default state', () => {
    const fletch = createStore({ name: 'sample' });

    const state = fletch.retrieve('/');

    expect(state).toEqual({ name: 'sample' });
  });
});

describe('#commit', () => {
  it('fills in the parent values if they are not defined', () => {
    const { commit, retrieve } = createStore();

    commit('/a/b/c/', { value: 'object' });

    expect(retrieve('/')).toEqual({ a: { b: { c: { value: 'object' } } } });
  });

  it('when a function is passed as a parameter it calls the function', () => {
    const { commit, retrieve } = createStore({ a: { b: { c: 'result' } } });

    commit('/a/b/', (state: any) => ({
      ...state,
      c: 'newresult',
      d: 'additionalresult',
    }));

    expect(retrieve('/')).toEqual({ a: { b: { c: 'newresult', d: 'additionalresult' } } });
  });
});

describe('#retrieve', () => {
  it('with null parents returns undefined', () => {
    const { retrieve } = createStore({ a: 'test' });

    expect(retrieve('/a/b/c/d')).toEqual(undefined);
  });

  it('with a proper path returns the value', () => {
    const { retrieve } = createStore({ a: { b: { c: 'test' } } });

    expect(retrieve('/a/b/c')).toEqual('test');
  });
});

describe('#subscribe', () => {
  it('with an exact match is called with the state', () => {
    const { commit, subscribe } = createStore({ a: { b: { c: 'test' } } });

    const observer = jest.fn();
    subscribe('/a/b/c', observer);

    commit('/a/b/c', 'othertest');

    expect(observer).toHaveBeenCalledWith({ a: { b: { c: 'othertest' } } });
  });

  it('with a regular expression match is called with the state', () => {
    const { commit, subscribe } = createStore({ a: { b: { c: 'test' } } });

    const observer = jest.fn();
    subscribe('/a/.+/c', observer);

    commit('/a/b/c', 'othertest');

    expect(observer).toHaveBeenCalledWith({ a: { b: { c: 'othertest' } } });
  });

  it('without a match is not called', () => {
    const { commit, subscribe } = createStore({ a: { b: { c: 'test' } } });

    const observer = jest.fn();
    subscribe('/a/d/c', observer);

    commit('/a/b/c', 'othertest');

    expect(observer).not.toHaveBeenCalledWith({ a: { b: { c: 'othertest' } } });
  });

  it('gives an unsubscribe method for unsubscribing locally', () => {
    const { commit, subscribe } = createStore({ a: { b: { c: 'test' } } });

    const observer = jest.fn();
    const otherObserver = jest.fn();
    const { unsubscribe } = subscribe('/a/b/c', otherObserver);

    subscribe('/a/b/c', observer);

    commit('/a/b/c', 'othertest');

    expect(observer).toHaveBeenCalledWith({ a: { b: { c: 'othertest' } } });
    expect(otherObserver).toHaveBeenCalledWith({ a: { b: { c: 'othertest' } } });

    observer.mockClear();
    otherObserver.mockClear();

    unsubscribe();

    commit('/a/b/c', 'thirdtest');

    expect(observer).toHaveBeenCalledWith({ a: { b: { c: 'thirdtest' } } });
    expect(otherObserver).not.toHaveBeenCalledWith({ a: { b: { c: 'thirdtest' } } });
  });
});

describe('#unsubscribeAll', () => {
  it('with a path clears the subscribers for that path', () => {
    const { commit, subscribe, unsubscribeAll } = createStore({ a: { b: { c: 'test' } } });

    const observer = jest.fn();
    const otherObserver = jest.fn();

    subscribe('/a/b/c', otherObserver);
    subscribe('/a/b/c', observer);

    commit('/a/b/c', 'othertest');

    expect(observer).toHaveBeenCalledWith({ a: { b: { c: 'othertest' } } });
    expect(otherObserver).toHaveBeenCalledWith({ a: { b: { c: 'othertest' } } });

    observer.mockClear();
    otherObserver.mockClear();

    unsubscribeAll();

    commit('/a/b/c', 'thirdtest');

    expect(observer).not.toHaveBeenCalledWith({ a: { b: { c: 'thirdtest' } } });
    expect(otherObserver).not.toHaveBeenCalledWith({ a: { b: { c: 'thirdtest' } } });
  });

  it('without a path removes every subscriber', () => {
    const { commit, subscribe, unsubscribeAll } = createStore({ a: { b: { c: 'test' } } });

    const observer = jest.fn();
    const otherObserver = jest.fn();

    subscribe('/a/b/c', otherObserver);
    subscribe('/a/b/c', observer);

    commit('/a/b/c', 'othertest');

    expect(observer).toHaveBeenCalledWith({ a: { b: { c: 'othertest' } } });
    expect(otherObserver).toHaveBeenCalledWith({ a: { b: { c: 'othertest' } } });

    observer.mockClear();
    otherObserver.mockClear();

    unsubscribeAll();

    commit('/a/b/c', 'thirdtest');

    expect(observer).not.toHaveBeenCalledWith({ a: { b: { c: 'thirdtest' } } });
    expect(otherObserver).not.toHaveBeenCalledWith({ a: { b: { c: 'thirdtest' } } });
  });
});
