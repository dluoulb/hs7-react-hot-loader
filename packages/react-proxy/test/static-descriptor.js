import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';

function createModernFixtures() {
  class StaticDescriptor extends Component {
    static get answer() {
      return 42;
    }

    static set something(value) {
      this._something = value * 2;
    }

    render() {
      return <div>{this.constructor.answer}</div>;
    }
  }

  class StaticDescriptorUpdate extends Component {
    static get answer() {
      return 43;
    }

    static set something(value) {
      this._something = value * 3;
    }

    render() {
      return <div>{this.constructor.answer}</div>;
    }
  }

  class StaticDescriptorRemoval extends Component {
    render() {
      return <div>{this.constructor.answer}</div>;
    }
  }

  class ThrowingAccessors extends Component {
    static get something() {
      throw new Error();
    }

    static set something(value) {
      throw new Error();
    }
  }

  return {
    StaticDescriptor,
    StaticDescriptorUpdate,
    StaticDescriptorRemoval,
    ThrowingAccessors
  };
}

describe('static descriptor', () => {
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

  describe('modern', () => {
    let StaticDescriptor;
    let StaticDescriptorUpdate;
    let StaticDescriptorRemoval;
    let ThrowingAccessors;

    beforeEach(() => {
      ({
        StaticDescriptor,
        StaticDescriptorUpdate,
        StaticDescriptorRemoval,
        ThrowingAccessors
      } = createModernFixtures());
    });

    it('does not invoke accessors', () => {
      const proxy = createProxy(StaticDescriptor);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(() => proxy.update(ThrowingAccessors)).toNotThrow();
    });

    it('replaces non-configurable properties', () => {
      Object.defineProperty(StaticDescriptor, 'nonConfigProp', {
        configurable: false,
        value: 10,
      });
      Object.defineProperty(StaticDescriptorUpdate, 'nonConfigProp', {
        configurable: false,
        value: 11,
      });

      const proxy = createProxy(StaticDescriptor);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(instance.constructor.nonConfigProp).toEqual(10);
      proxy.update(StaticDescriptorUpdate);
      expect(instance.constructor.nonConfigProp).toEqual(11);
    });

    describe('getter', () => {
      it('is available on proxy class', () => {
        const proxy = createProxy(StaticDescriptor);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(42);
        expect(instance.constructor.answer).toEqual(42);
        expect(Proxy.answer).toEqual(42);
      });

      it('gets added', () => {
        const proxy = createProxy(StaticDescriptorRemoval);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(undefined);

        proxy.update(StaticDescriptor);
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(42);
        expect(instance.constructor.answer).toEqual(42);
      });

      it('gets replaced', () => {
        const proxy = createProxy(StaticDescriptor);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(42);

        proxy.update(StaticDescriptorUpdate);
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(43);
        expect(instance.constructor.answer).toEqual(43);

        proxy.update(StaticDescriptorRemoval);
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(undefined);
        expect(instance.answer).toEqual(undefined);
      });

      it('gets redefined', () => {
        const proxy = createProxy(StaticDescriptor);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(42);

        Object.defineProperty(instance.constructor, 'answer', {
          value: 7
        });

        proxy.update(StaticDescriptorUpdate);
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(7);
        expect(instance.constructor.answer).toEqual(7);

        proxy.update(StaticDescriptorRemoval);
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(7);
        expect(instance.constructor.answer).toEqual(7);
      });
    });

    describe('setter', () => {
      it('is available on proxy class instance', () => {
        const proxy = createProxy(StaticDescriptor);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        instance.constructor.something = 10;
      });

      it('gets added', () => {
        const proxy = createProxy(StaticDescriptorRemoval);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);

        proxy.update(StaticDescriptor);
        instance.constructor.something = 10;
        expect(instance.constructor._something).toEqual(20);
      });

      it('gets replaced', () => {
        const proxy = createProxy(StaticDescriptor);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        instance.constructor.something = 10;
        expect(instance.constructor._something).toEqual(20);

        proxy.update(StaticDescriptorUpdate);
        expect(instance.constructor._something).toEqual(20);
        instance.constructor.something = 10;
        expect(instance.constructor._something).toEqual(30);

        proxy.update(StaticDescriptorRemoval);
        expect(instance.constructor._something).toEqual(30);
        instance.constructor.something = 7;
        expect(instance.constructor.something).toEqual(7);
        expect(instance.constructor._something).toEqual(30);
      });

      it('gets redefined', () => {
        const proxy = createProxy(StaticDescriptor);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(42);

        Object.defineProperty(instance.constructor, 'something', {
          value: 50
        });

        proxy.update(StaticDescriptorUpdate);
        expect(instance.constructor.something).toEqual(50);
      });
    });
  });
});
