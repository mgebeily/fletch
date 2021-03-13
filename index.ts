// TODO: Run observers on global or changed state?
// TODO: Only path match instead of regex? Literal match?
const runObservers = (observers: { [key:string]: ((_: any) => any)[] }, path: string, state: any) => {
  Object.keys(observers).forEach((observerPath) => {
    if (path.match(observerPath)) {
      observers[observerPath].forEach((observerFunction) => {
        observerFunction(state)
      })
    }
  })
}

const cleanPath = (path: string) => path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');

export const createStore = (defaultStore?: any) => {
  let observers: { [key:string]: ((_: any) => any)[] } = {};
  let state = { ...defaultStore };

  return {
    retrieve: (path: string) => {
      let newState = state;
      const fragments = cleanPath(path).split('/');

      for(let x = 0; x < fragments.length; x++) {
        if (fragments[x].length === 0) {
          continue;
        } else if (newState === undefined) {
          return undefined;
        } else {
          newState = newState[fragments[x]];
        }
      }
      return newState;
    },
    commit: (path: string, commitObject: any) => {
      const cleanedPath = cleanPath(path)
      const fragments = cleanedPath.split('/')

      if (fragments.length === 0) {
        state = typeof commitObject === 'function' ? commitObject(state) : commitObject;
        runObservers(observers, cleanedPath, state)
      }

      let newState = state;
      for(let x = 0; x < fragments.length - 1; x++) {
        if (newState[fragments[x]] === undefined || typeof newState[fragments[x]] !== 'object') {
          // TODO: Does this count as immutable
          newState[fragments[x]] = {}
        }
        newState = newState[fragments[x]];
      }

      if (commitObject.constructor.name === 'AsyncFunction') {
        return commitObject(newState[fragments[fragments.length - 1]]).then((result: any) => {
          newState[fragments[fragments.length - 1]] = result;
          runObservers(observers, cleanedPath, state)
        });
      } else if (commitObject.constructor.name === 'Function') {
        newState[fragments[fragments.length - 1]] = commitObject(newState[fragments[fragments.length - 1]]);
        runObservers(observers, cleanedPath, state)
      } else {
        newState[fragments[fragments.length - 1]] = commitObject;
        runObservers(observers, cleanedPath, state)
      }

      return state;
    },
    subscribe: (path: string, observer: (_: any) => any) => {
      const cleanedPath = cleanPath(path);

      observers[cleanedPath] = observers[cleanedPath] || [];
      // TODO: Hash this?
      const index = observers[cleanedPath].push(observer);
      return {
        unsubscribe: () => {
          // TODO: Stop this?
          delete observers[cleanedPath][index - 1];
        }
      }
    },
    unsubscribeAll: (path?: string) => {
      if (path) {
        observers[cleanPath(path)] = [];
      } else {
        observers = [] as any;
      }
    }
  }
}
