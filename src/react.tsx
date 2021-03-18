// eslint-disable-next-line no-use-before-define
import React from 'react';
import { createStore, FletchState } from '.';

const Context = React.createContext<FletchState>({} as any);

export const FletchContext = ({ defaultValue, children }: React.PropsWithChildren<any>) => {
  const fletch = createStore(defaultValue);

  return (
    <Context.Provider value={{ ...fletch }}>
      {children}
    </Context.Provider>
  );
};

export const useRetrieve = (path?: string): FletchState => {
  const context = React.useContext(Context);

  if (!context) {
    throw new Error('Please make sure your context provider is properly set up.');
  }

  const currentState = context.retrieve(path || '/');
  const [, dispatch] = React.useReducer((s) => s + 1, 0);

  // For each new path, add a subscriber
  React.useLayoutEffect(() => {
    const { unsubscribe } = context.subscribe(path || '/', () => {
      dispatch();
    });
    return unsubscribe;
  }, [path]);

  return currentState;
};

export const useCommit = () => {
  const context = React.useContext(Context);

  if (!context) {
    throw new Error('Please make sure your context provider is properly set up.');
  }

  return context.commit;
};
