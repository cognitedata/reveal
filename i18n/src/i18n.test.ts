import i18next from 'i18next';
import configureI18n from './i18n';

describe('i18n setup', () => {
  it('setting language from props - default', () => {
    configureI18n();
    expect(i18next.options.lng).toEqual('en');
  });

  it('setting language from props - lng prop', () => {
    configureI18n({
      lng: 'testLanguage',
      localStorageLanguageKey: 'should_not_cause_trouble', // 'lng' has higher precidence
    });
    expect(i18next.options.lng).toEqual('testLanguage');
  });

  it('setting language from props - ls key', () => {
    const localStorageMock = (() => {
      return {
        getItem: (key: string) => key,
      };
    })();

    const temp = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    configureI18n({
      localStorageLanguageKey: 'TEST_KEY_FROM_LS',
    });
    expect(i18next.options.lng).toEqual('TEST_KEY_FROM_LS');

    // revert LS changes
    Object.defineProperty(window, 'localStorage', {
      value: temp,
    });
  });
});
