import {
  blacklistByType,
  getProxyByType,
  setComponentOptions,
} from './reconciler/proxies'
import configuration from './configuration'
import { hotComponentCompare } from './reconciler/componentComparator'

const getProxyOrType = type => {
  const proxy = getProxyByType(type)
  return proxy ? proxy.get() : type
}

export const areComponentsEqual = (a, b) =>
  getProxyOrType(a) === getProxyOrType(b)

export const compareOrSwap = (oldType, newType) =>
  hotComponentCompare(oldType, newType)

export const cold = type => {
  blacklistByType(type)
  return type
}

export const configureComponent = (component, options) =>
  setComponentOptions(component, options)

export const setConfig = config => Object.assign(configuration, config)
