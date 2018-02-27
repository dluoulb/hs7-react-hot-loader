import reactHotLoader from '../reactHotLoader'
import { get as getGeneration } from '../global/generation'
import { getProxyByType, setStandInOptions } from './proxies'
import reconcileHotReplacement, { flushScheduledUpdates } from './index'

export const RENDERED_GENERATION = 'REACT_HOT_LOADER_RENDERED_GENERATION'

export const renderReconciler = (target, force) => {
  // we are not inside parent reconcilation
  const currentGeneration = getGeneration()
  const componentGeneration = target[RENDERED_GENERATION]

  target[RENDERED_GENERATION] = currentGeneration

  if (!reactHotLoader.disableProxyCreation) {
    if (
      (componentGeneration || force) &&
      componentGeneration !== currentGeneration
    ) {
      reconcileHotReplacement(target)
      return true
    }
  }
  return false
}

function asyncReconciledRender(target) {
  renderReconciler(target, false)
}

function syncReconciledRender(target) {
  if (renderReconciler(target, false)) {
    flushScheduledUpdates()
  }
}

export const proxyWrapper = element => {
  // post wrap on post render
  if (!element) {
    return element
  }
  if (Array.isArray(element)) {
    return element.map(proxyWrapper)
  }
  if (typeof element.type === 'function') {
    const proxy = getProxyByType(element.type)
    if (proxy) {
      return {
        ...element,
        type: proxy.get(),
      }
    }
  }
  return element
}

setStandInOptions({
  componentWillReceiveProps: syncReconciledRender,
  componentWillRender: asyncReconciledRender,
  componentDidRender: proxyWrapper,
})
