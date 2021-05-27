// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

const makeStorageArea = () => ({
  clear: jest.fn(cb => {
    cb();
  }),
  get: jest.fn((getter, cb) => {
    cb();
  }),
  getBytesInUse: jest.fn(cb => {
    cb();
  }),
  remove: jest.fn((keys, cb) => {
    cb();
  }),
  set: jest.fn((setter, cb) => {
    cb();
  })
});

Object.assign(global, {
  chrome: {
    storage: {
      local: makeStorageArea(),
      sync: makeStorageArea(),
      managed: makeStorageArea()
    },
    runtime: {}
  }
});
