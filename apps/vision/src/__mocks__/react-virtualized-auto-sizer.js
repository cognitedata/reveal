// __mocks__/react-virtualized-auto-sizer.js

const reactVirtualizedAutoSizer = jest.requireActual(
  'react-virtualized-auto-sizer'
);

module.exports = {
  ...reactVirtualizedAutoSizer,
  __esModule: true,
  default: ({ children }) => children({ height: 1000, width: 500 }),
};
