'use strict';

/**
 * Returns a function that establishes the first prototype passed to it
 * as the "source of truth" and patches its methods on subsequent invocations,
 * also patching current and previous prototypes to forward calls to it.
 */
module.exports = function makeAssimilatePrototype() {
  var storedPrototype,
      knownPrototypes = [];

  function wrapMethod(key) {
    return function () {
      if (storedPrototype[key]) {
        return storedPrototype[key].apply(this, arguments);
      }
    };
  }

  function patchProperty(proto, key) {
    proto[key] = storedPrototype[key];

    if (typeof proto[key] !== 'function' ||
      key === 'type' ||
      key === 'constructor') {
      return;
    }

    proto[key] = wrapMethod(key);

    if (proto.__reactAutoBindMap && proto.__reactAutoBindMap[key]) {
      proto.__reactAutoBindMap[key] = proto[key];
    }
  }

  function updateStoredPrototype(freshPrototype) {
    storedPrototype = {};

    for (var key in freshPrototype) {
      if (freshPrototype.hasOwnProperty(key)) {
        storedPrototype[key] = freshPrototype[key];
      }
    }
  }

  function reconcileWithStoredPrototypes(freshPrototype) {
    knownPrototypes.push(freshPrototype);
    knownPrototypes.forEach(function (proto) {
      for (var key in storedPrototype) {
        patchProperty(proto, key);
      }
    });
  }

  return function assimilatePrototype(freshPrototype) {
    updateStoredPrototype(freshPrototype);
    reconcileWithStoredPrototypes(freshPrototype);
  };
};