import { useMemo } from 'react';

import { Body, Flex, Select, Title } from '@cognite/cogs.js';

type LanguageTabProps = {
  locale?: LanguageTabLocale;
  language: string;
  selectLanguage: (language: string) => void;
};

const supportedLanguages = {
  en: 'english',
  de: 'german',
  'de-AT': 'german-at',
  es: 'spanish',
  fr: 'french',
  it: 'italian',
  ja: 'japanese',
  ko: 'korean',
  nl: 'dutch',
  pt: 'portuguese',
  ro: 'romanian',
  sv: 'swedish',
  zh: 'chinese',
} as const;

export type LanguageTabLocale = {
  translations: {
    'language-tab-title': string;
    'language-tab-subtitle': string;
    'language-field-label': string;
    'language-chinese-label'?: string;
    'language-dutch-label'?: string;
    'language-english-label': string;
    'language-french-label'?: string;
    'language-german-label'?: string;
    'language-german-at-label'?: string;
    'language-italian-label'?: string;
    'language-japanese-label': string;
    'language-korean-label'?: string;
    'language-portuguese-label'?: string;
    'language-romanian-label'?: string;
    'language-spanish-label'?: string;
    'language-swedish-label'?: string;
  };
};

const DEFAULT_LOCALE: LanguageTabLocale = {
  translations: {
    'language-tab-title': 'Language',
    'language-tab-subtitle':
      'Information about your language preferences across Cognite Data Fusion',
    'language-field-label': 'Language',
    'language-chinese-label': '中文 (Zhōngwén), 汉语, 漢語 | zh',
    'language-dutch-label': 'Nederlands, Vlaams | nl',
    'language-english-label': 'English | en',
    'language-french-label': 'Français, langue française | fr',
    'language-german-label': 'Deutsch | de',
    'language-german-at-label': 'Deutsch AT | de-AT',
    'language-italian-label': 'Italiano | it',
    'language-japanese-label': '日本語 (にほんご／にっぽんご) | ja',
    'language-korean-label': '한국어 (韓國語), 조선말 (朝鮮語) | ko',
    'language-portuguese-label': 'Português | pt',
    'language-romanian-label': 'română | ro',
    'language-spanish-label': 'Español, Castellano | es',
    'language-swedish-label': 'svenska | sv',
  },
};

export const LanguageTab = ({
  language,
  selectLanguage,
  locale = DEFAULT_LOCALE,
}: LanguageTabProps): JSX.Element => {
  const options = useMemo(
    () =>
      Object.keys(supportedLanguages)
        .map((languageKey) => ({
          label:
            locale.translations[
              `language-${
                supportedLanguages[
                  languageKey as keyof typeof supportedLanguages
                ]
              }-label`
            ],
          value: languageKey,
        }))
        .filter(
          (l): l is { label: string; value: string } =>
            Boolean(l.label) && Boolean(l.value)
        ),
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
