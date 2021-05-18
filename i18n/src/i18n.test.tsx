import React from 'react';
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { storage } from '@cognite/storage';
import configureI18n, { Trans, useTranslation } from './i18n';

describe('i18n setup', () => {
  it('setting language from props - default', () => {
    configureI18n();
    expect(i18next.options.lng).toEqual('en');
  });

  it('test disabled mode', () => {
    configureI18n({ disabled: true });
    const { t } = useTranslation('test');
    expect(t('test', { defaultValue: 'testing' })).toEqual('testing');
  });

  it('test <Trans> in disabled mode', () => {
    const Component = () => {
      configureI18n({ disabled: true });
      const { t } = useTranslation('test');
      return (
        <Trans t={t} i18nKey="some-key">
          Some text
        </Trans>
      );
    };

    render(<Component />);
    screen.getByText('Some text');
  });

  it('setting language from props - lng prop', () => {
    configureI18n({
      lng: 'testLanguage',
      localStorageLanguageKey: 'should_not_cause_trouble', // 'lng' has higher precidence
    });
    expect(i18next.options.lng).toEqual('testLanguage');
  });

  it('setting language from props - ls key', () => {
    jest.spyOn(storage, 'getFromLocalStorage').mockImplementation((value) => {
      return value;
    });

    configureI18n({
      localStorageLanguageKey: 'TEST_KEY_FROM_LS',
    });

    expect(i18next.options.lng).toEqual('TEST_KEY_FROM_LS');

    jest.resetAllMocks();
  });
});
