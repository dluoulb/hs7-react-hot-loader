import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect.js';
import { createProxy } from '../src';

const fixtures = {
  modern: {
    InstanceProperty: class InstanceProperty {
      answer = 42;

      render() {
        return <div>{this.answer}</div>;
      }
    },

    InstancePropertyUpdate: class InstancePropertyUpdate {
      answer = 43;

      render() {
        return <div>{this.answer}</div>;
      }
    },

    InstancePropertyRemoval: class InstancePropertyRemoval {
      render() {
        return <div>{this.answer}</div>;
      }
    }
  }
};

describe('instance property', () => {
  let renderer;

  beforeEach(() => {
    renderer = createShallowRenderer();
  });

  Object.keys(fixtures).forEach(type => {
    const { InstanceProperty, InstancePropertyUpdate, InstancePropertyRemoval } = fixtures[type];

    it(`is available on hotified class instance (${type})`, () => {
      const proxy = createProxy(InstanceProperty);
      const InstancePropertyProxy = proxy.get();
      const instance = renderer.render(<InstancePropertyProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(instance.answer).to.equal(42);
    });

    it(`is left unchanged when reassigned (${type})`, () => {
      const proxy = createProxy(InstanceProperty);
      const InstancePropertyProxy = proxy.get();
      const instance = renderer.render(<InstancePropertyProxy />);
      expect(renderer.getRenderOutput().props.children).to.eql(42);

      instance.answer = 100;

      proxy.update(InstancePropertyUpdate);
      renderer.render(<InstancePropertyProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(100);
      expect(instance.answer).to.equal(100);

      proxy.update(InstancePropertyRemoval);
      renderer.render(<InstancePropertyProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(100);
      expect(instance.answer).to.equal(100);
    });

    /**
     * I'm not aware of any way of retrieving their new values
     * without calling the constructor, which seems like too much
     * of a side effect. We also don't want to overwrite them
     * in case they changed.
     */
    it(`known limitation: is left unchanged even if not reassigned (${type})`, () => {
      const proxy = createProxy(InstanceProperty);
      const InstancePropertyProxy = proxy.get();
      const instance = renderer.render(<InstancePropertyProxy />);
      expect(renderer.getRenderOutput().props.children).to.eql(42);

      proxy.update(InstancePropertyUpdate);
      renderer.render(<InstancePropertyProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(instance.answer).to.equal(42);

      proxy.update(InstancePropertyRemoval);
      renderer.render(<InstancePropertyProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(instance.answer).to.equal(42);
    });
  });
});