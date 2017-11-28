import {isNativeFunction, reactLifeCycleMethods} from './react-utils';
import {REGENERATE_METHOD, PREFIX, GENERATION} from "./symbols";

function mergeComponents(ProxyComponent, NextComponent, PreviousComponents) {
  const injectedCode = {};
  try {
    const ins2 = new NextComponent({}, {});

    try {
      // bypass babel class inheritance checking
      PreviousComponents.forEach(PreviousComponent => PreviousComponent.prototype = NextComponent.prototype);
    }catch(e){
      // It was es6 class
    }

    const ins1 = new ProxyComponent({}, {});

    const mergeProps = Object.assign({}, ins1, ins2);
    const hasRegenerate = ins1[REGENERATE_METHOD];
    Object
      .keys(mergeProps)
      .filter(key => !key.startsWith(PREFIX))
      .forEach(function (key) {
        const next = ins2[key];
        const prev = ins1[key];
        if (isNativeFunction(next) || isNativeFunction(prev)) {
          // this is bound method
          if (next.length === prev.length) {
            injectedCode[key] = `Object.getPrototypeOf(this)['${key}'].bind(this)`;
          } else {
            console.error('React-stand-in:',
              'Updated class ', ProxyComponent.name, 'contains native or bound function ', key, next,
              '. Unable to reproduce, use arrow functions instead.');
          }
          return;
        }

        if (("" + next) !== ("" + prev)) {
          if (!hasRegenerate) {
            console.error('React-stand-in:',
              ' Updated class ', ProxyComponent.name, 'had different code for', key, next,
              '. Unable to reproduce. Regeneration support needed.');
          } else {
            injectedCode[key] = next;
          }
        }

      });
  } catch (e) {
    console.error('React-stand-in:', e);
  }
  return injectedCode;
}

function checkLifeCycleMethods(ProxyComponent, NextComponent) {
  try {
    const p1 = ProxyComponent.prototype;
    const p2 = NextComponent.prototype;
    reactLifeCycleMethods
      .forEach(function (key) {
        if (("" + p1[key]) != ("" + p2[key])) {
          console.error('React-stand-in:', 'You did update', ProxyComponent.name, '\s lifecycle method', p2[key], '. Unable to repeat');
        }
      });
  } catch (e) {

  }
}

function inject(target, currentGeneration, injectedMembers) {
  if (target[GENERATION] !== currentGeneration) {
    Object
      .keys(injectedMembers)
      .forEach(key => target[REGENERATE_METHOD](key, '/*RHL*/'+injectedMembers[key]));

    target[GENERATION] = currentGeneration;
  }
}


export {
  mergeComponents,
  checkLifeCycleMethods,
  inject
}