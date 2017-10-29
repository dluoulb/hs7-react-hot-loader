import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect.js';
import { createPatch } from '../src';

class Counter1x extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
  }

  increment() {
    this.setState({
      counter: this.state.counter + 1
    });
  }

  render() {
    return <span>{this.state.counter}</span>;
  }
}

class Counter10x extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
  }

  increment() {
    this.setState({
      counter: this.state.counter + 10
    });
  }

  render() {
    return <span>{this.state.counter}</span>;
  }
}

class Counter100x extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
  }

  increment() {
    this.setState({
      counter: this.state.counter + 100
    });
  }

  render() {
    return <span>{this.state.counter}</span>;
  }
}

class CounterWithoutIncrementMethod extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
  }

  render() {
    return <span>{this.state.counter}</span>;
  }
}

describe('instance method', () => {
  let renderer;
  let patch;

  beforeEach(() => {
    renderer = createShallowRenderer();
    patch = createPatch();
  });

  it('gets replaced', () => {
    const HotCounter = patch(Counter1x);
    const instance = renderer.render(<HotCounter />);
    expect(renderer.getRenderOutput().props.children).to.equal(0);
    instance.increment();
    expect(renderer.getRenderOutput().props.children).to.equal(1);

    patch(Counter10x);
    instance.increment();
    renderer.render(<HotCounter />);
    expect(renderer.getRenderOutput().props.children).to.equal(11);

    patch(Counter100x);
    instance.increment();
    renderer.render(<HotCounter />);
    expect(renderer.getRenderOutput().props.children).to.equal(111);
  });

  it('gets replaced if bound', () => {
    const HotCounter = patch(Counter1x);
    const instance = renderer.render(<HotCounter />);

    instance.increment = instance.increment.bind(instance);

    expect(renderer.getRenderOutput().props.children).to.equal(0);
    instance.increment();
    expect(renderer.getRenderOutput().props.children).to.equal(1);

    patch(Counter10x);
    instance.increment();
    renderer.render(<HotCounter />);
    expect(renderer.getRenderOutput().props.children).to.equal(11);

    patch(Counter100x);
    instance.increment();
    renderer.render(<HotCounter />);
    expect(renderer.getRenderOutput().props.children).to.equal(111);
  });

  /**
   * It is important to make deleted methods no-ops
   * so they don't crash if setTimeout-d or setInterval-d.
   */
  it('is detached and acts as a no-op if not reassigned and deleted', () => {
    const HotCounter = patch(Counter1x);
    const instance = renderer.render(<HotCounter />);
    expect(renderer.getRenderOutput().props.children).to.equal(0);
    instance.increment();
    const savedIncrement = instance.increment;
    expect(renderer.getRenderOutput().props.children).to.equal(1);

    patch(CounterWithoutIncrementMethod);
    expect(instance.increment).to.equal(undefined);
    savedIncrement.call(instance);
    renderer.render(<HotCounter />);
    expect(renderer.getRenderOutput().props.children).to.equal(1);
  });

  it('is attached and acts as a no-op if reassigned and deleted', () => {
    const HotCounter = patch(Counter1x);
    const instance = renderer.render(<HotCounter />);

    instance.increment = instance.increment.bind(instance);

    expect(renderer.getRenderOutput().props.children).to.equal(0);
    instance.increment();
    expect(renderer.getRenderOutput().props.children).to.equal(1);

    patch(CounterWithoutIncrementMethod);
    instance.increment();
    renderer.render(<HotCounter />);
    expect(renderer.getRenderOutput().props.children).to.equal(1);
  });
});