import React, { Component } from 'react';
import createShallowRenderer from '../helpers/createShallowRenderer';
import expect from 'expect.js';
import { createPatch } from '../../src';

class InstanceProperty {
  answer = 42;

  render() {
    return <div>{this.answer}</div>;
  }
}

class InstancePropertyUpdate {
  answer = 43;

  render() {
    return <div>{this.answer}</div>;
  }
}

class InstancePropertyRemoval {
  render() {
    return <div>{this.answer}</div>;
  }
}

describe('instance property', () => {
  let renderer;
  let patch;

  beforeEach(() => {
    renderer = createShallowRenderer();
    patch = createPatch();
  });

  it('is available on hotified class instance', () => {
    const HotInstanceProperty = patch(InstanceProperty);
    const instance = renderer.render(<HotInstanceProperty />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(instance.answer).to.equal(42);
  });

  it('is left unchanged when reassigned', () => {
    const HotInstanceProperty = patch(InstanceProperty);
    const instance = renderer.render(<HotInstanceProperty />);
    expect(renderer.getRenderOutput().props.children).to.eql(42);

    instance.answer = 100;

    patch(InstancePropertyUpdate);
    renderer.render(<HotInstanceProperty />);
    expect(renderer.getRenderOutput().props.children).to.equal(100);
    expect(instance.answer).to.equal(100);

    patch(InstancePropertyRemoval);
    renderer.render(<HotInstanceProperty />);
    expect(renderer.getRenderOutput().props.children).to.equal(100);
    expect(instance.answer).to.equal(100);
  });

  /**
   * I'm not aware of any way of retrieving their new values
   * without calling the constructor, which seems like too much
   * of a side effect. We also don't want to overwrite them
   * in case they changed.
   */
  it('is left unchanged when not reassigned (meh)', () => {
    const HotInstanceProperty = patch(InstanceProperty);
    const instance = renderer.render(<HotInstanceProperty />);
    expect(renderer.getRenderOutput().props.children).to.eql(42);

    patch(InstancePropertyUpdate);
    renderer.render(<HotInstanceProperty />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(instance.answer).to.equal(42);

    patch(InstancePropertyRemoval);
    renderer.render(<HotInstanceProperty />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(instance.answer).to.equal(42);
  });
});