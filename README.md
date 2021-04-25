# fletch
A tiny (~1KB with no dependencies), simple, somewhat opinionated state management library.

# Motivation

The flux pattern is one that's grown on me since I started working in React. However, the mental model never really clicked with me. In its most popular implementation, Redux, the idea of splitting your state management into action creators, reducers, and selectors often caused even a simple change to a state to be spread across multiple files and an explosion of action types, further clouding the mental overhead of the front end state. This design decision also slightly obfuscates the shape of the state by separating it from the actions used to change it. Lastly, its usage was unopinionated, which could lead to several disparate patterns appearing in a widely used codebase.

As a thought experiment, I put together a library that mimics a form of state management that's already taken root in my brain: that of a CRUD API. When interfacing with an API, the URL gives a clear indicator of the resource to be updated, the HTTP method gives a clue as to the type of update, and the body indicates the content of the resulting update. It's a pattern that a developer is most likely already working with. In using it, the front end state may even take a similar shape to the backend data, fascilitating usage such as caching of resources. Here's hoping you agree with the pattern and design of the library!

# Installation 

```
npm install fletch-state

or 

yarn add fletch-state
```

Then import it:

```
// CommonJS
const { createStore } = require('fletch-state');

// ES6 imports
import { createStore } from 'fletch-state';
```

# Usage

Initialize a state with the `createStore` method. By default, the state is empty.

```
const { commit, retrieve } = createStore();
```

You can also start with a default state.

```
const { commit, retrieve } = createStore({ user: { id: 1, name: 'Marc' } });
```

You can make changes with the commit method using a url to specify the object path.

```
commit('/user/name', 'Not Marc');

// Returns new state: { user: { id: 1, name: 'Not Marc' } }
```

You can also commit using a function. The state at the object path will be passed into your function. The state will be updated at that path using the value you return.

```
commit('/user', (user) => {
  return {
    ...user,
    id: user.id + 1
  }
});

// Returns new state: { user: { id: 2, name: 'Not Marc' } }
```

You can get the state at any point using `retrieve`.

```
retrieve('/user')

// Returns the state: { id: 2, name: 'Not Marc' }
```

You can also get the entire state at once:

```
retrieve('/')

// Returns the state: { user: { id: 2, name: 'Not Marc' }}
```

You can subscribe to state changes at any point using `subscribe`.

```
const { unsubscribe } = subscribe('/user/name', ({ user: { name } }) => {
  console.log(`The user name has been changed to ${name}`)
})


commit('/user/id', 5) // Does not trigger anything.
commit('/user/name', 'Some other name') // Logs "The user name has been changed to Some other name"

unsubscribe()

commit('/user/name', 'Some other name') // Does not trigger anything.
```

You can detach any subscriptions using `unsubscribeAll`.

```
unsubscribeAll() // Removes all observers.
unsubscribeAll('/user/name') // Removes observers only on name.
```

Subscriptions use the same matchers as the top level mutation listeners. This means they are done using the literal path that is passed in and not the object structure.

# React

Fletch comes with some react bindings to make things easier for those familiar with hooks. Simply call:

```
import { FletchContext } from 'fletch/dist/react';

const TopLevelComponent = ({ children }) => {
  <FletchContext defaultValue={{ name: 'A name to use' }}>
    { children }
  </FletchContext>
}
```

Then, in any children, you can use hooks for both commit and retrieve.

```
import { useCommit, useRetrieve } from 'fletch/dist/react';

const ChildComponent = () => {
  const name = useRetrieve('/name')
  const commit = useCommit()

  return <>
    <h1>{ name }</h1>
    <button onClick={() => { commit('/name', name + ' again') }></button> 
  </>
}
```

The above will render name and re-render with the new state each time the button is clicked.

Note that these hooks use the same subscribe pipeline as the rest of the library. Therefor, `unsubscribeAll` will remove listeners for the hooks as well. I suggest not using `unsubscribeAll` when using the React bindings for this library.
