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

describe('consistency', () => {
  let renderer;

  beforeEach(() => {
    renderer = createShallowRenderer();
  });

  Object.keys(fixtures).forEach(type => {
    const { Bar, Baz, Foo } = fixtures[type];

    it(`does not overwrite the original class (${type})`, () => {
      const proxy = createProxy(Bar);
      const BarProxy = proxy.get();
      const barInstance = renderer.render(<BarProxy />);
      expect(renderer.getRenderOutput().props.children).toEqual('Bar');

      proxy.update(Baz);
      const realBarInstance = renderer.render(<Bar />);
      expect(renderer.getRenderOutput().props.children).toEqual('Bar');
      expect(barInstance).toNotEqual(realBarInstance);
      expect(barInstance.didUnmount).toEqual(true);
    });

    it(`sets up constructor to match the type (${type})`, () => {
      let proxy = createProxy(Bar);
      const BarProxy = proxy.get();
      const barInstance = renderer.render(<BarProxy />);
      expect(barInstance.constructor).toEqual(BarProxy);
      expect(barInstance instanceof BarProxy).toEqual(true);

      proxy.update(Baz);
      const HotBaz = proxy.get();
      expect(BarProxy).toEqual(HotBaz);
      expect(barInstance.constructor).toEqual(HotBaz);
      expect(barInstance instanceof HotBaz).toEqual(true);
    });
  });
});