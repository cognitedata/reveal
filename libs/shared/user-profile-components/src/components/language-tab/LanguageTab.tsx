import { Flex, Select, Title } from '@cognite/cogs.js';

import { DEFAULT_SUPPORTED_LANGUAGES } from '../../common/constants';
import { Language } from '../../common/types';
import { useIsScreenWideEnough } from '../../hooks/useIsScreenWideEnough';
import { OnTrackEvent, languageChangeEvent } from '../../metrics';

type LanguageTabProps = {
  selectedLanguage: Language;
  supportedLanguages: Language[];
  onLanguageChange: (language: Language | undefined) => void;
  title?: string;
  languageFieldLabel?: string;
  onTrackEvent?: OnTrackEvent;
};

export const LanguageTab = ({
  selectedLanguage,
  supportedLanguages = DEFAULT_SUPPORTED_LANGUAGES,
  onLanguageChange,
  title = 'Language',
  languageFieldLabel = 'Language',
  onTrackEvent,
}: LanguageTabProps): JSX.Element => {
  const isScreenWideEnough = useIsScreenWideEnough();
  const options = supportedLanguages
    .map((language) => ({
      label: language.label,
      value: language.code,
    }))
    .filter((opt) => opt.label && opt.value);

  return (
    <Flex direction="column" gap={24}>
      {isScreenWideEnough && (
        <Flex direction="column" gap={4}>
          <Title level={4}>{title}</Title>
        </Flex>
      )}
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
            onTrackEvent?.(languageChangeEvent, {
              prevLanguage: selectedLanguage,
              newLanguage: newLanguage || null,
            });
            onLanguageChange(newLanguage);
          }}
          options={options}
          value={options.find(({ value }) => value === selectedLanguage.code)}
        />
      </Flex>
    </Flex>
  );
};
