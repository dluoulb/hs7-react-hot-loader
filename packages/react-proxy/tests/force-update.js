import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect.js';
import { createProxy } from '../src';

const fixtures = {
  modernNoSuperClass: {
    Bar: class Bar {
      render() {
        return <div>Bar</div>;
      }
    },

    Baz: class Baz {
      render() {
        return <div>Baz</div>;
      }
    },

    Foo: class Foo {
      render() {
        return <div>Foo</div>;
      }
    }
  },
  modernWithSuperclass: {
    Bar: class Bar extends Component {
      render() {
        return <div>Bar</div>;
      }
    },

    Baz: class Baz extends Component {
      render() {
        return <div>Baz</div>;
      }
    },

    Foo: class Foo extends Component {
      render() {
        return <div>Foo</div>;
      }
    },
  },
  modernShouldComponentUpdateFalse: {
    Bar: class Bar {
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return <div>Bar</div>;
      }
    },

    Baz: class Baz {
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return <div>Baz</div>;
      }
    },

    Foo: class Foo {
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return <div>Foo</div>;
      }
    }
  }
};

describe('force update', () => {
  let renderer;

  beforeEach(() => {
    renderer = createShallowRenderer();
  });

  Object.keys(fixtures).forEach(type => {
    const { Bar, Baz, Foo } = fixtures[type];

    it(`gets triggered (${type})`, () => {
      const proxy = createProxy(Bar);
      const BarProxy = proxy.get();
      renderer.render(<BarProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal('Bar');

      proxy.update(Baz);
      expect(renderer.getRenderOutput().props.children).to.equal('Baz');

      proxy.update(Foo);
      expect(renderer.getRenderOutput().props.children).to.equal('Foo');
    });
  });
});