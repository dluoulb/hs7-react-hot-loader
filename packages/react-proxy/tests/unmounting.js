import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect.js';
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
  }
};

describe('unmounting', () => {
  let renderer;

  beforeEach(() => {
    renderer = createShallowRenderer();
  });

  Object.keys(fixtures).forEach(type => {
    const { Bar, Baz, Foo } = fixtures[type];

    it(`happens without proxy (${type})`, () => {
      const barInstance = renderer.render(<Bar />);
      expect(renderer.getRenderOutput().props.children).to.equal('Bar');
      const bazInstance = renderer.render(<Baz />);
      expect(renderer.getRenderOutput().props.children).to.equal('Baz');
      expect(barInstance).to.not.equal(bazInstance);
      expect(barInstance.didUnmount).to.equal(true);
    });

    it(`does not happen when rendering new proxied versions (${type})`, () => {
      const proxy = createProxy(Bar);
      const BarProxy = proxy.get();
      const barInstance = renderer.render(<BarProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal('Bar');

      proxy.update(Baz);
      const HotBaz = proxy.get();
      const bazInstance = renderer.render(<HotBaz />);
      expect(renderer.getRenderOutput().props.children).to.equal('Baz');
      expect(barInstance).to.equal(bazInstance);
      expect(barInstance.didUnmount).to.equal(undefined);

      proxy.update(Foo);
      const HotFoo = proxy.get();
      const fooInstance = renderer.render(<HotFoo />);
      expect(renderer.getRenderOutput().props.children).to.equal('Foo');
      expect(barInstance).to.equal(fooInstance);
      expect(barInstance.didUnmount).to.equal(undefined);
    });

    it(`does not happen when rendering old proxied versions (${type})`, () => {
      const proxy = createProxy(Bar);
      const BarProxy = proxy.get();
      const barInstance = renderer.render(<BarProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal('Bar');

      proxy.update(Baz);
      const bazInstance = renderer.render(<BarProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal('Baz');
      expect(barInstance).to.equal(bazInstance);
      expect(barInstance.didUnmount).to.equal(undefined);

      proxy.update(Foo);
      const fooInstance = renderer.render(<BarProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal('Foo');
      expect(barInstance).to.equal(fooInstance);
      expect(barInstance.didUnmount).to.equal(undefined);
    });
  });
});