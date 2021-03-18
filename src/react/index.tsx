import React, { useLayoutEffect, useMemo, useReducer, useRef } from 'react';
import { createStore } from '..';
import { FletchState } from '..'

const Context = React.createContext<FletchState>({} as any)

export const FletchContext = ({ defaultValue, children, ...props }: React.PropsWithChildren<any>) => {
  const fletch = createStore(defaultValue)
  const subscribers: { [key:string]: Function[] } = {  }

  return <Context.Provider value={{ subscribers, ...fletch }} {...props}>
    {children}
  </Context.Provider>
}

export const useRetrieve = (path?: string): FletchState => {
  const context = React.useContext(Context);

  if (!context) {
    throw new Error("Please make sure your context provider is properly set up.")
  }

  const currentState = context.retrieve(path || '/')
  const [_, dispatch] = useReducer((s) => s + 1, 0)

  // For each new path, add a subscriber
  useLayoutEffect(() => {
    const { unsubscribe } = context.subscribe(path || '/', () => {
      dispatch()
    })
    return unsubscribe;
  }, [path])

  return currentState;
}

export const useCommit = () => {
  const context = React.useContext(Context)

  if (!context) {
    throw new Error("Please make sure your context provider is properly set up.")
  }

  return context.commit;
}