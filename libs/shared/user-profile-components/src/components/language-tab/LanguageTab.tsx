import { Body, Flex, Select, Title } from '@cognite/cogs.js';

import { DEFAULT_SUPPORTED_LANGUAGES } from '../../common/constants';
import { Language } from '../../common/types';

type LanguageTabProps = {
  selectedLanguage: Language;
  supportedLanguages: Language[];
  onLanguageChange: (language: Language | undefined) => void;
  title?: string;
  subtitle?: string;
  languageFieldLabel?: string;
};

export const LanguageTab = ({
  selectedLanguage,
  supportedLanguages = DEFAULT_SUPPORTED_LANGUAGES,
  onLanguageChange,
  title = 'Language',
  subtitle = 'Information about your language preferences across Cognite Data Fusion',
  languageFieldLabel = 'Language',
}: LanguageTabProps): JSX.Element => {
  const options = supportedLanguages
    .map((language) => ({
      label: language.label,
      value: language.code,
    }))
    .filter((opt) => opt.label && opt.value);

  return (
    <Flex direction="column" gap={24}>
      <Flex direction="column" gap={4}>
        <Title level={4}>{title}</Title>
        <Body level={2}>{subtitle}</Body>
      </Flex>
      <Flex direction="column" gap={24}>
        <Select
          label={languageFieldLabel}
          onChange={(option: {
            label: Language['label'];
            value: Language['code'];
          }) => {
            const newLanguage = supportedLanguages.find(
              ({ code }: Language) => code === option.value
            );
            onLanguageChange(newLanguage);
          }}
          options={options}
          value={options.find(({ value }) => value === selectedLanguage.code)}
        />
      </Flex>
    </Flex>
  );
};
