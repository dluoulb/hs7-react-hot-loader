React Hotify *(warning: alpha quality)*
=========

>Note: this project is **unstable** and is a **work-in-progress evolution** of **[React Hot Loader](http://gaearon.github.io/react-hot-loader)**.  
>**Don't use it for real projects yet, use [React Hot Loader](http://gaearon.github.io/react-hot-loader) instead.**

This project is a successor of [React Hot API](https://github.com/gaearon/react-hot-api).  
It has less features and is much less mature.

For now, use at your own risk.  
Read [The Death of React Hot Loader](https://medium.com/@dan_abramov/the-death-of-react-hot-loader-765fa791d7c4) for some context.

### Can I Play With This?

**[Absolutely.](https://github.com/gaearon/react-hotify-boilerplate)** See also this **[Babel plugin](https://github.com/gaearon/babel-plugin-react-hotify).**

### Limitations

Alpha quality. 0.13+. Only ES6 React classes are supported at the moment. No error handling. [TODO might give some idea.](https://github.com/gaearon/react-hotify/blob/master/TODO)

### Usage

Annotate component classes with the [decorator](https://github.com/wycats/javascript-decorators) this library exports.
The decorator accepts one parameter: **a string uniquely identifying the given component class in your application.** It should persist between the live edit reloads. For example, you can use the module filename concatenated with the class name.

You should generate these decorator calls (e.g. with a [Babel plugin](https://babeljs.io/docs/usage/plugins/)) so users don't have to write them.

### Examples

#### Webpack (with [Babel plugin](https://github.com/gaearon/babel-plugin-react-hotify))

```js
import React from 'react';

// This class is hot-reloadable!
class Other {
  render() {
    return (
      <h1>hmm.</h1>
    );
  }
}

// This class is hot-reloadable!
export default class App extends React.Component {
  render() {
    return (
      <Other />
    );
  }
}

// Opt-in to Webpack hot module replacement for the module
module.hot.accept(); // Maybe write another plugin to generate this one line?
```

#### Webpack (without [Babel plugin](https://github.com/gaearon/babel-plugin-react-hotify))

```js
import React from 'react';
import hotify from 'react-hotify'; // Your tool should generate this to make this class hot-reloadable

@hotify(`${module.id}-Other`) // Your tool should generate this to make this class hot-reloadable
class Other {
  render() {
    return (
      <h1>hmm.</h1>
    );
  }
}

@hotify(`${module.id}-App`) // Your tool should generate this to make this class hot-reloadable
export default class App extends React.Component {
  render() {
    return (
      <Other />
    );
  }
}

// Opt-in to Webpack hot module replacement for the module
module.hot.accept(); // Your tool should generate this to make this class hot-reloadable
```


#### Browserify

???

(Not now, but I want to bring it there!)

### Tests

This time, [we've got tests!](https://github.com/gaearon/react-hotify/blob/master/src/__tests__/makeHotify-test.js)

```
npm install
npm test
```

### License

MIT
