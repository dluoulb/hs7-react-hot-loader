import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import { createProxy } from '../src';

const fixtures = {
  modern: {
    Bar: class Bar {
      componentWillUnmount() {
        this.didUnmount = true;
      }

      render() {
        return <div>Bar</div>;
      }
    },

    Baz: class Baz {
      componentWillUnmount() {
        this.didUnmount = true;
      }

      render() {
        return <div>Baz</div>;
      }
    },

    Foo: class Foo {
      componentWillUnmount() {
        this.didUnmount = true;
      }

      render() {
        return <div>Foo</div>;
      }
    }
  },

  classic: {
    Bar: React.createClass({
      componentWillUnmount() {
        this.didUnmount = true;
      },

      render() {
        return <div>Bar</div>;
      }
    }),

    Baz: React.createClass({
      componentWillUnmount() {
        this.didUnmount = true;
      },

      render() {
        return <div>Baz</div>;
      }
    }),

    Foo: React.createClass({
      componentWillUnmount() {
        this.didUnmount = true;
      },

      render() {
        return <div>Foo</div>;
      }
    })
  }
};

describe('unmounting', () => {
  let renderer;
  let warnSpy;

  beforeEach(() => {
    renderer = createShallowRenderer();
    warnSpy = expect.spyOn(console, 'warn').andCallThrough();
  });

  afterEach(() => {
    warnSpy.destroy();
    expect(warnSpy.calls.length).toBe(0);
  });

  Object.keys(fixtures).forEach(type => {
    describe(type, () => {
      const { Bar, Baz, Foo } = fixtures[type];

      it('happens without proxy', () => {
        const barInstance = renderer.render(<Bar />);
        expect(renderer.getRenderOutput().props.children).toEqual('Bar');
        const bazInstance = renderer.render(<Baz />);
        expect(renderer.getRenderOutput().props.children).toEqual('Baz');
        expect(barInstance).toNotEqual(bazInstance);
        expect(barInstance.didUnmount).toEqual(true);
      });

      it('does not happen when rendering new proxied versions', () => {
        const proxy = createProxy(Bar);
        const BarProxy = proxy.get();
        const barInstance = renderer.render(<BarProxy />);
        expect(renderer.getRenderOutput().props.children).toEqual('Bar');

        proxy.update(Baz);
        const BazProxy = proxy.get();
        const bazInstance = renderer.render(<BazProxy />);
        expect(renderer.getRenderOutput().props.children).toEqual('Baz');
        expect(barInstance).toEqual(bazInstance);
        expect(barInstance.didUnmount).toEqual(undefined);

        proxy.update(Foo);
        const FooProxy = proxy.get();
        const fooInstance = renderer.render(<FooProxy />);
        expect(renderer.getRenderOutput().props.children).toEqual('Foo');
        expect(barInstance).toEqual(fooInstance);
        expect(barInstance.didUnmount).toEqual(undefined);
      });

      it('does not happen when rendering old proxied versions', () => {
        const proxy = createProxy(Bar);
        const Proxy = proxy.get();
        const barInstance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual('Bar');

        proxy.update(Baz);
        const bazInstance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual('Baz');
        expect(barInstance).toEqual(bazInstance);
        expect(barInstance.didUnmount).toEqual(undefined);

        proxy.update(Foo);
        const fooInstance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual('Foo');
        expect(barInstance).toEqual(fooInstance);
        expect(barInstance.didUnmount).toEqual(undefined);
      });
    });
  });
});