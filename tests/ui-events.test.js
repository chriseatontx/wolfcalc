import test from 'node:test';
import assert from 'node:assert/strict';
import { bindActionClicks } from '../js/core/action-clicks.js';

function createRoot(children) {
  let clickHandler;
  return {
    addEventListener(type, handler) {
      assert.equal(type, 'click');
      clickHandler = handler;
    },
    contains(element) {
      return children.includes(element);
    },
    click(target) {
      assert.equal(typeof clickHandler, 'function');
      clickHandler({ target });
    },
  };
}

const softKeys = [
  { name: 'F1', action: 'angle', value: undefined },
  { name: 'F2', action: 'memory', value: 'M+' },
  { name: 'F3', action: 'memory', value: 'M-' },
  { name: 'F4', action: 'memory', value: 'MR' },
  { name: 'F5', action: 'memory', value: 'MC' },
];

for (const key of softKeys) {
  test(`clicking ${key.name} routes its labeled action to the calculator`, () => {
    const button = { dataset: { action: key.action, ...(key.value ? { value: key.value } : {}) } };
    const nestedLabel = {
      closest(selector) {
        assert.equal(selector, 'button[data-action]');
        return button;
      },
    };
    const root = createRoot([button]);
    const activated = [];

    bindActionClicks(root, candidate => activated.push(candidate));
    root.click(nestedLabel);

    assert.deepEqual(activated, [button]);
    assert.equal(activated[0].dataset.action, key.action);
    assert.equal(activated[0].dataset.value, key.value);
  });
}

test('click delegation ignores action buttons outside the calculator shell', () => {
  const outsideButton = { dataset: { action: 'angle' } };
  const outsideTarget = { closest: () => outsideButton };
  const root = createRoot([]);
  const activated = [];

  bindActionClicks(root, button => activated.push(button));
  root.click(outsideTarget);

  assert.deepEqual(activated, []);
});

test('click delegation still routes keypad buttons inside the calculator shell', () => {
  const keypadButton = { dataset: { action: 'digit', value: '7' } };
  const keypadTarget = { closest: () => keypadButton };
  const root = createRoot([keypadButton]);
  const activated = [];

  bindActionClicks(root, button => activated.push(button));
  root.click(keypadTarget);

  assert.deepEqual(activated, [keypadButton]);
});
