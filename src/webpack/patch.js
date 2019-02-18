const injectionStart = {
  '16.6': [
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : child.elementType === element.type)',
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : hotCompareElements(child.elementType, element.type, hotUpdateChild(child), child.type))'
  ],
  '16.6-compact': [
    'if(child.tag===Fragment?element.type===REACT_FRAGMENT_TYPE:child.elementType===element.type)',
    'if(child.tag===Fragment?element.type===REACT_FRAGMENT_TYPE:hotCompareElements(child.elementType,element.type, hotUpdateChild(child), child.type))'
  ],
  '16.4': [
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : child.type === element.type) {',
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : hotCompareElements(child.type, element.type, hotUpdateChild(child), child.type)) {'
  ],
  '16.4-compact': [
    'if(child.tag===Fragment?element.type===REACT_FRAGMENT_TYPE:child.type===element.type)',
    'if(child.tag===Fragment?element.type===REACT_FRAGMENT_TYPE:hotCompareElements(child.type,element.type, hotUpdateChild(child), child.type))'
  ],
};

const additional = {
  '16.6-update': [
    'if (current$$1 !== null && current$$1.elementType === element.type) {',
    'if (current$$1 !== null && hotCompareElements(current$$1.elementType, element.type, hotUpdateChild(current$$1),current$$1.type)) {'
  ],
  '16.6-update-compact': [
    'if(current$$1!==null&&current$$1.elementType===element.type)',
    'if(current$$1!==null&&hotCompareElements(current$$1.elementType,element.type,hotUpdateChild(current$$1),current$$1.type))'
  ],
  '16.4-update': [
    'if (current !== null && current.type === element.type) {',
    'if (current !== null && hotCompareElements(current.type, element.type, hotUpdateChild(current),current.type)) {'
  ],
  '16.4-update-compact': [
    'if (current!== null&&current.type===element.type)',
    'if (current!== null&&hotCompareElements(current.type,element.type,hotUpdateChild(current)))'
  ]
};

const ReactHotLoaderInjection = `
var hotUpdateChild = function (child) {
  return function (newType) {
    child.type = newType;
    if (child.alternate) {
      child.alternate.type = newType;
    }
  }
};
var hotCompareElements = function (oldType, newType) {
  return oldType === newType
};
var hotCleanupHooks = function () {
  firstCurrentHook = null;
  currentHook = null;
  firstWorkInProgressHook = null;
  workInProgressHook = null;
  nextWorkInProgressHook = null;
  
  remainingExpirationTime = NoWork;
  componentUpdateQueue = null;
  sideEffectTag = 0;
}
var ReactDOM = {
  evalInReactContext: function (injection) {
    return eval(injection);
  },
  hotCleanup: hotCleanupHooks,
  hotRenderWithHooks: function (current, render) {       
    hotCleanupHooks();
    
    firstCurrentHook = nextCurrentHook = current !== null ? current.memoizedState : null;
    
    ReactCurrentDispatcher$1.current = nextCurrentHook === null ? HooksDispatcherOnMountInDEV : HooksDispatcherOnUpdateInDEV;
    
    var rendered = render();
    
    hotCleanupHooks();
    
    return rendered;
  },
  setHotElementComparator: function (newComparator) {
    hotCompareElements = newComparator
  },
`;

const defaultEnd = [
  'var ReactDOM = {',
  ReactHotLoaderInjection
];

const defaultEndCompact = [
  'var ReactDOM={',
  ReactHotLoaderInjection
];


const injectionEnd = {
  '16.6': defaultEnd,
  '16.4': defaultEnd,
  '16.6-compact': defaultEndCompact,
  '16.4-compact': defaultEndCompact,
};

const sign = '/* 🔥 this is hot-loader/react-dom 🔥 */';

function additionalTransform(source) {
  for (const key in additional) {
    source = source.split(additional[key][0]).join(additional[key][1])
  }
  return source;
}

function transform(source) {
  if (source.indexOf('reconcileSingleElement') < 0) {
    // early reject
    return source;
  }
  if (source.indexOf(sign) >= 0) {
    // already patched
    return;
  }
  for (const key in injectionStart) {
    if (
      source.indexOf(injectionStart[key][0]) > 0 &&
      source.indexOf(injectionEnd[key][0]) > 0
    ) {
      const result = additionalTransform(
        source
          .replace(injectionStart[key][0], injectionStart[key][1])
          .replace(injectionEnd[key][0], injectionEnd[key][1])
      );
      return `${sign}\n${result}\n${sign}`;
    }
  }
  return source;
}

module.exports = transform;
