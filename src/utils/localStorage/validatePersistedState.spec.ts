// eslint-disable-next-line jest/no-mocks-import
import { MOCK_PROJECT_NAME } from 'src/__mocks__/MockedCogniteClient';
import { validatePersistedState } from 'src/utils/localStorage/validatePersistedState';
import { APP_STATE_VERSION } from 'src/utils/localStorage/LocalStorage';

describe('Test Validate Persisted State', () => {
  test('valid project name and app version', () => {
    expect(validatePersistedState(MOCK_PROJECT_NAME, APP_STATE_VERSION)).toBe(
      true
    );
  });

  test('invalid project name', () => {
    expect(
      validatePersistedState(`${MOCK_PROJECT_NAME}-new`, APP_STATE_VERSION)
    ).toBe(false);
  });

  test('invalid app version', () => {
    expect(
      validatePersistedState(MOCK_PROJECT_NAME, APP_STATE_VERSION + 1)
    ).toBe(false);
  });

  test('invalid project name and invalid app version', () => {
    expect(
      validatePersistedState(`${MOCK_PROJECT_NAME}-new`, APP_STATE_VERSION + 1)
    ).toBe(false);
  });
});
