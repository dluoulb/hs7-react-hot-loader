import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';

function createModernFixtures() {
  class Bar extends Component {
    componentWillUnmount() {
      this.didUnmount = true;
    }

    render() {
      return <div>Bar</div>;
    }
  }

  class Baz extends Component {
    componentWillUnmount() {
      this.didUnmount = true;
    }

    render() {
      return <div>Baz</div>;
    }
  }

  class Foo extends Component {
    componentWillUnmount() {
      this.didUnmount = true;
    }

    render() {
      return <div>Foo</div>;
    }
  }

  return {
    Bar,
    Baz,
    Foo
  };
}

function createClassicFixtures() {
  const Bar = React.createClass({
    componentWillUnmount() {
      this.didUnmount = true;
    },

    render() {
      return <div>Bar</div>;
    }
  });

  const Baz = React.createClass({
    componentWillUnmount() {
      this.didUnmount = true;
    },

    render() {
      return <div>Baz</div>;
    }
  });

  const Foo = React.createClass({
    componentWillUnmount() {
      this.didUnmount = true;
    },

    render() {
      return <div>Foo</div>;
    }
  });

  return {
    Bar,
    Baz,
    Foo
  };
}

describe('unmounting', () => {
  let renderer;
  let warnSpy;

  beforeEach(() => {
    renderer = createShallowRenderer();
    warnSpy = expect.spyOn(console, 'error').andCallThrough();
  });

  afterEach(() => {
    warnSpy.destroy();
    expect(warnSpy.calls.length).toBe(0);
  });

  function runCommonTests(createFixtures) {
    let Bar;
    let Baz;
    let Foo;

    beforeEach(() => {
      ({
        Bar,
        Baz,
        Foo
      } = createFixtures());
    });

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
  }

  describe('classic', () => {
    runCommonTests(createClassicFixtures);
  });

  describe('modern', () => {
    runCommonTests(createModernFixtures);
  });
});