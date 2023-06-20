import { useMemo } from 'react';

import { Body, Flex, Select, Title } from '@cognite/cogs.js';

type LanguageTabProps = {
  locale?: LanguageTabLocale;
  language: string;
  selectLanguage: (language: string) => void;
};

export type LanguageTabLocale = {
  translations: {
    'language-tab-title': string;
    'language-tab-subtitle': string;
    'language-field-label': string;
    'language-english-label': string;
    'language-japanese-label': string;
  };
};

const DEFAULT_LOCALE: LanguageTabLocale = {
  translations: {
    'language-tab-title': 'Language',
    'language-tab-subtitle':
      'Information about your language preferences across Cognite Data Fusion',
    'language-field-label': 'Language',
    'language-english-label': 'English',
    'language-japanese-label': '日本語',
  },
};

export const LanguageTab = ({
  language,
  selectLanguage,
  locale = DEFAULT_LOCALE,
}: LanguageTabProps): JSX.Element => {
  const options = useMemo(
    () => [
      {
        label: locale.translations['language-english-label'],
        value: 'en',
      },
      {
        label: locale.translations['language-japanese-label'],
        value: 'ja',
      },
    ],
    [locale]
  );

  return (
    <Flex direction="column" gap={24}>
      <Flex direction="column" gap={4}>
        <Title level={4}>{locale.translations['language-tab-title']}</Title>
        <Body level={2}>{locale.translations['language-tab-subtitle']}</Body>
      </Flex>
      <Flex direction="column" gap={24}>
        <Select
          label={locale.translations['language-field-label']}
          onChange={(option: any) => {
            selectLanguage(option?.value);
          }}
          options={options}
          value={options.find(({ value }) => value === language)}
        />
      </Flex>
    </Flex>
  );
};
