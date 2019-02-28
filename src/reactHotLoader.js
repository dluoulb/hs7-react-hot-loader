/* eslint-disable no-use-before-define */
import {
  isCompositeComponent,
  getComponentDisplayName,
  isLazyType,
  isMemoType,
  isForwardType,
  isContextType,
} from './internal/reactUtils'
import { increment as incrementGeneration } from './global/generation'
import {
  updateProxyById,
  resetProxies,
  getProxyById,
  isTypeBlacklisted,
  registerComponent,
  updateFunctionProxyById,
} from './reconciler/proxies'
import configuration from './configuration'
import logger from './logger'

import { preactAdapter } from './adapters/preact'
import {
  updateContext,
  updateForward,
  updateLazy,
  updateMemo,
} from './reconciler/fiberUpdater'
import { resolveType } from './reconciler/resolver'
import { hotComponentCompare } from './reconciler/componentComparator'

const forceSimpleSFC = { proxy: { pureSFC: true } }

const reactHotLoader = {
  IS_REACT_MERGE_ENABLED: false,
  register(type, uniqueLocalName, fileName, options = {}) {
    const id = `${fileName}#${uniqueLocalName}`

    if (
      isCompositeComponent(type) &&
      typeof uniqueLocalName === 'string' &&
      uniqueLocalName &&
      typeof fileName === 'string' &&
      fileName
    ) {
      const proxy = getProxyById(id)

      if (proxy && proxy.getCurrent() !== type) {
        // component got replaced. Need to reconcile
        incrementGeneration()

        if (!reactHotLoader.IS_REACT_MERGE_ENABLED) {
          if (
            isTypeBlacklisted(type) ||
            isTypeBlacklisted(proxy.getCurrent())
          ) {
            logger.error(
              'React-hot-loader: Cold component',
              uniqueLocalName,
              'at',
              fileName,
              'has been updated',
            )
          }
        }
      }

      if (configuration.onComponentRegister) {
        configuration.onComponentRegister(type, uniqueLocalName, fileName)
      }
      if (configuration.onComponentCreate) {
        configuration.onComponentCreate(type, getComponentDisplayName(type))
      }

      registerComponent(updateProxyById(id, type, options).get(), 2)
      registerComponent(type)
    }
    if (isContextType({ type })) {
      // possible options - Context, Consumer, Provider.
      ;['Provider', 'Consumer'].forEach(prop => {
        const descriptor = Object.getOwnPropertyDescriptor(type, prop)
        if (descriptor && descriptor.value) {
          updateFunctionProxyById(
            `${id}:${prop}`,
            descriptor.value,
            updateContext,
          )
        }
      })
      updateFunctionProxyById(id, type, updateContext)
      incrementGeneration()
    }
    if (isLazyType({ type })) {
      updateFunctionProxyById(id, type, updateLazy)
      incrementGeneration()
    }
    if (isForwardType({ type })) {
      updateFunctionProxyById(id, type, updateForward)
      incrementGeneration()
    }
    if (isMemoType({ type })) {
      reactHotLoader.register(
        type.type,
        `${uniqueLocalName}:memo`,
        fileName,
        forceSimpleSFC,
      )
      updateFunctionProxyById(id, type, updateMemo)
      incrementGeneration()
    }
  },

  reset() {
    resetProxies()
  },

  preact(instance) {
    preactAdapter(instance, resolveType)
  },

  resolveType(type) {
    return resolveType(type)
  },

  patch(React, ReactDOM) {
    /* eslint-disable no-console */
    if (ReactDOM && ReactDOM.setHotElementComparator) {
      ReactDOM.setHotElementComparator(hotComponentCompare)
      configuration.disableHotRenderer =
        configuration.disableHotRendererWhenInjected

      configuration.ignoreSFC = configuration.ignoreSFCWhenInjected

      reactHotLoader.IS_REACT_MERGE_ENABLED = true
    } else {
      // Actually everything works...
      console.warn(
        'React-Hot-Loader: react-🔥-dom patch is not detected. React 16.6+ features may not work.',
      )
    }
    /* eslint-enable */
    if (!React.createElement.isPatchedByReactHotLoader) {
      const originalCreateElement = React.createElement
      // Trick React into rendering a proxy so that
      // its state is preserved when the class changes.
      // This will update the proxy if it's for a known type.
      React.createElement = (type, ...args) =>
        originalCreateElement(resolveType(type), ...args)
      React.createElement.isPatchedByReactHotLoader = true
    }

    if (!React.cloneElement.isPatchedByReactHotLoader) {
      const originalCloneElement = React.cloneElement

      React.cloneElement = (element, ...args) => {
        const newType = element.type && resolveType(element.type)
        if (newType && newType !== element.type) {
          return originalCloneElement(
            {
              ...element,
              type: newType,
            },
            ...args,
          )
        }
        return originalCloneElement(element, ...args)
      }

      React.cloneElement.isPatchedByReactHotLoader = true
    }

    if (!React.createFactory.isPatchedByReactHotLoader) {
      // Patch React.createFactory to use patched createElement
      // because the original implementation uses the internal,
      // unpatched ReactElement.createElement
      React.createFactory = type => {
        const factory = React.createElement.bind(null, type)
        factory.type = type
        return factory
      }
      React.createFactory.isPatchedByReactHotLoader = true
    }

    if (!React.Children.only.isPatchedByReactHotLoader) {
      const originalChildrenOnly = React.Children.only
      // Use the same trick as React.createElement
      React.Children.only = children =>
        originalChildrenOnly({ ...children, type: resolveType(children.type) })
      React.Children.only.isPatchedByReactHotLoader = true
    }

    // reactHotLoader.reset()
  },
}

export default reactHotLoader
