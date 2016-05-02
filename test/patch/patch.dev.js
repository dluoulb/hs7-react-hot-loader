import '../../src/patch.dev';
import expect, { spyOn } from 'expect';
import React from 'react';

const RHL = global.__REACT_HOT_LOADER__;
function A1() {}
function A2() {}
function A3() {}
function B1() {}
function B2() {}

describe('patch', () => {
  beforeEach(() => {
    RHL.reset();
  });

  it('is identity for unrecognized types', () => {
    expect(<div />.type).toBe('div');
    expect(<A1 />.type).toBe(A1);
  });

  it('ignores late registrations', () => {
    function Kanye() {}
    function Kanye2() {}

    React.createElement(Kanye);

    // By this time we have to assume the user might have rendered it.
    // It's unsafe to resolve it to a different type afterwards,
    // or we may cause an existing component to unmount unpredictably.
    // https://github.com/gaearon/react-hot-loader/issues/241

    const spy = spyOn(console, 'error');
    try {
      RHL.register(Kanye, 'Yeezy', '/wow/test.js');
      expect(console.error.calls.length).toBe(1);
      expect(console.error.calls[0].arguments[0]).toBe(
        'React Hot Loader: Yeezy in /wow/test.js will not hot reload ' +
        'correctly because test.js uses <Yeezy /> during ' +
        'module definition. For hot reloading to work, move Yeezy ' +
        'into a separate file and import it from test.js.'
      );
      expect(<Kanye />.type).toBe(Kanye);
      expect(<Kanye2 />.type).toBe(Kanye2);

      RHL.register(Kanye2, 'Yeezy', '/wow/test.js');
      expect(console.error.calls.length).toBe(1);
      expect(<Kanye />.type).toBe(Kanye);
      expect(<Kanye2 />.type).toBe(Kanye2);
    } finally {
      spy.restore();
    }
  });

  it('resolves registered types by their last ID', () => {
    RHL.register(A1, 'a', 'test.js');
    const A = <A1 />.type;
    expect(A).toNotBe(A1);
    expect(A).toBeA('function');
    expect(<A />.type).toBe(A);

    RHL.register(A2, 'a', 'test.js');
    expect(<A1 />.type).toBe(A);
    expect(<A2 />.type).toBe(A);
    expect(<A />.type).toBe(A);

    RHL.register(A3, 'a', 'test.js');
    expect(<A1 />.type).toBe(A);
    expect(<A2 />.type).toBe(A);
    expect(<A3 />.type).toBe(A);
    expect(<A />.type).toBe(A);

    RHL.register(B1, 'b', 'test.js');
    const B = <B1 />.type;
    expect(<A1 />.type).toBe(A);
    expect(<A2 />.type).toBe(A);
    expect(<A3 />.type).toBe(A);
    expect(<A />.type).toBe(A);
    expect(<B1 />.type).toBe(B);
    expect(<B />.type).toBe(B);

    RHL.register(B2, 'b', 'test.js');
    expect(<A1 />.type).toBe(A);
    expect(<A2 />.type).toBe(A);
    expect(<A3 />.type).toBe(A);
    expect(<A />.type).toBe(A);
    expect(<B1 />.type).toBe(B);
    expect(<B2 />.type).toBe(B);
    expect(<B />.type).toBe(B);
  });

  it('works with reexported types', () => {
    RHL.register(A1, 'a', 'test.js');
    RHL.register(A1, 'x', 'test2.js');

    const A = <A1 />.type;
    expect(A.type).toNotBe(A1);
    expect(A).toBeA('function');
    expect(<A />.type).toBe(A);

    RHL.register(A2, 'a', 'test.js');
    RHL.register(A2, 'x', 'test2.js');
    expect(<A1 />.type).toBe(A);
    expect(<A2 />.type).toBe(A);
    expect(<A />.type).toBe(A);
  });

  it('passes props through', () => {
    expect(<div x={42} y='lol' />.props).toEqual({
      x: 42,
      y: 'lol'
    });
    expect(<A1 x={42} y='lol' />.props).toEqual({
      x: 42,
      y: 'lol'
    });

    RHL.register(B1, 'b', 'test.js');
    expect(<B1 x={42} y='lol' />.props).toEqual({
      x: 42,
      y: 'lol'
    });
    RHL.register(B2, 'b', 'test.js');
    expect(<B2 x={42} y='lol' />.props).toEqual({
      x: 42,
      y: 'lol'
    });
  });

  it('passes children through', () => {
    expect(<div>{'Hi'}{'Bye'}</div>.props.children).toEqual([
      'Hi',
      'Bye'
    ]);
    expect(<A1>{'Hi'}{'Bye'}</A1>.props.children).toEqual([
      'Hi',
      'Bye'
    ]);

    RHL.register(B1, 'b', 'test.js');
    expect(<B1>{'Hi'}{'Bye'}</B1>.props.children).toEqual([
      'Hi',
      'Bye'
    ]);
    RHL.register(B2, 'b', 'test.js');
    expect(<B2>{'Hi'}{'Bye'}</B2>.props.children).toEqual([
      'Hi',
      'Bye'
    ]);
  });
});