import { MOCK_PROJECT_NAME } from '../../__mocks__/MockedCogniteClient';

import { APP_STATE_VERSION } from './LocalStorage';
import { validatePersistedState } from './validatePersistedState';

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
