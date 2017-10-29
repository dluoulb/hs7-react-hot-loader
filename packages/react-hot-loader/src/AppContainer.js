/* eslint-disable global-require, import/no-mutable-exports */

let exportedModule

if (!module.hot || process.env.NODE_ENV === 'production') {
  exportedModule = require('./AppContainer.prod').default
} else {
  exportedModule = require('./AppContainer.dev').default
}

export default exportedModule
