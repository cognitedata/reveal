// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockI18n = require('./dist/mocks');

jest.mock('@cognite/i18n', () => {
  const actual = jest.requireActual('@cognite/react-i18n');
  return {
    ...actual,
    ...mockI18n,
  };
});
