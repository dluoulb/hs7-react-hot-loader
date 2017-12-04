/* eslint-env jest */
/* eslint-disable react/no-render-return-value */
import React from 'react'
import { createMounter, ensureNoWarnings } from './helper'
import createProxy from '../src'

const createFixtures = () => ({
  modern: {
    Bar: class Bar extends React.Component {
      componentWillUnmount() {
        this.didUnmount = true
      }

      doNothing() {}

      render() {
        return <div>Bar</div>
      }
    },

    Baz: class Baz extends React.Component {
      componentWillUnmount() {
        this.didUnmount = true
      }

      render() {
        return <div>Baz</div>
      }
    },

    Foo: class Foo extends React.Component {
      static displayName = 'Foo (Custom)'

      componentWillUnmount() {
        this.didUnmount = true
      }

      render() {
        return <div>Foo</div>
      }
    },
  },
})

describe('consistency', () => {
  ensureNoWarnings()
  const { mount } = createMounter()

  Object.keys(createFixtures()).forEach(type => {
    describe(type, () => {
      let Bar
      let Baz
      let Foo
      beforeEach(() => {
        ;({ Bar, Baz, Foo } = createFixtures()[type])
      })

      it('overwrites the original class', () => {
        const proxy = createProxy(Bar)
        const Proxy = proxy.get()
        const barWrapper = mount(<Proxy />)
        const barInstance = barWrapper.instance()
        expect(barWrapper.text()).toBe('Bar')

        proxy.update(Baz)

        const realBarWrapper = mount(<Bar />)
        const realBarInstance = realBarWrapper.instance()
        expect(realBarWrapper.text()).toBe('Baz')
        expect(barInstance).not.toBe(realBarInstance)
        expect(barInstance.didUnmount).toBe(true)
      })

      it('returns an existing proxy when wrapped twice', () => {
        const proxy = createProxy(Bar)
        const Proxy = proxy.get()
        const proxyTwice = createProxy(Proxy)
        expect(proxyTwice).toBe(proxy)
      })

      /*
       * https://github.com/reactjs/react-redux/issues/163#issuecomment-192556637
       */
      it('avoid false positives when statics are hoisted', () => {
        const fooProxy = createProxy(Foo)
        const FooProxy = fooProxy.get()

        class Stuff extends React.Component {
          render() {
            return null
          }
        }

        const KNOWN_STATICS = {
          name: true,
          length: true,
          prototype: true,
          caller: true,
          arguments: true,
          arity: true,
          type: true,
        }
        Object.getOwnPropertyNames(FooProxy).forEach(key => {
          if (!KNOWN_STATICS[key]) {
            Stuff[key] = FooProxy[key]
          }
        })

        const stuffProxy = createProxy(Stuff)
        expect(stuffProxy).not.toBe(fooProxy)
      })

      it('prevents recursive proxy cycle', () => {
        const proxy = createProxy(Bar)
        const Proxy = proxy.get()
        proxy.update(Proxy)
        expect(proxy.get()).toBe(Proxy)
      })

      it('prevents mutually recursive proxy cycle', () => {
        const barProxy = createProxy(Bar)
        const BarProxy = barProxy.get()

        const fooProxy = createProxy(Foo)
        const FooProxy = fooProxy.get()

        barProxy.update(FooProxy)
        fooProxy.update(BarProxy)
      })

      it('sets up constructor to match the type', () => {
        const proxy = createProxy(Bar)
        const BarProxy = proxy.get()
        const barInstance = mount(<BarProxy />).instance()
        expect(barInstance.constructor).toBe(BarProxy)
        expect(barInstance instanceof BarProxy).toBe(true)

        proxy.update(Baz)
        const BazProxy = proxy.get()
        expect(BarProxy).toBe(BazProxy)
        expect(barInstance.constructor).toBe(BazProxy)
        expect(barInstance instanceof BazProxy).toBe(true)
      })

      it('sets up displayName from displayName or name', () => {
        const proxy = createProxy(Bar)
        const Proxy = proxy.get()
        const barInstance = mount(<Proxy />).instance()
        expect(barInstance.constructor.displayName).toBe('Bar')

        proxy.update(Baz)
        expect(barInstance.constructor.displayName).toBe('Baz')

        proxy.update(Foo)
        expect(barInstance.constructor.displayName).toBe('Foo (Custom)')
      })

      it('inherits from base', () => {
        const proxy = createProxy(Bar)
        const Proxy = proxy.get()

        expect(Proxy.prototype instanceof Bar).toBe(true)
      })
    })
  })

  describe('modern only', () => {
    it('sets up the constructor name from initial name', () => {
      const { Bar, Baz } = createFixtures().modern
      const proxy = createProxy(Bar)
      const Proxy = proxy.get()
      expect(Proxy.name).toBe('Bar')

      proxy.update(Baz)
      expect(Proxy.name).toBe('Baz')
    })

    it('should not crash if new Function() throws', () => {
      const { Bar } = createFixtures().modern
      const oldFunction = global.Function

      global.Function = class extends oldFunction {
        constructor() {
          super()

          throw new Error()
        }
      }

      try {
        expect(() => {
          const proxy = createProxy(Bar)
          const Proxy = proxy.get()
          const barInstance = mount(<Proxy />).instance()
          expect(barInstance.constructor).toBe(Proxy)
        }).not.toThrow()
      } finally {
        global.Function = oldFunction
      }
    })
  })
})
