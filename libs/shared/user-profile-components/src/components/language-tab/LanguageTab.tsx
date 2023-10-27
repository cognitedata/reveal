import { Select } from '@cognite/cogs.js';

import { DEFAULT_SUPPORTED_LANGUAGES } from '../../common/constants';
import { Language } from '../../common/types';
import { OnTrackEvent, languageChangeEvent } from '../../metrics';
import { TabContent } from '../tab-content/TabContent';

type LanguageTabProps = {
  selectedLanguage: Language;
  supportedLanguages: Language[];
  onLanguageChange: (language: Language | undefined) => void;
  languageFieldLabel?: string;
  onTrackEvent?: OnTrackEvent;
};

export const LanguageTab = ({
  selectedLanguage,
  supportedLanguages = DEFAULT_SUPPORTED_LANGUAGES,
  onLanguageChange,
  languageFieldLabel = 'Preferred language',
  onTrackEvent,
}: LanguageTabProps): JSX.Element => {
  const options = supportedLanguages
    .map((language) => ({
      label: language.label,
      value: language.code,
    }))
    .filter((opt) => opt.label && opt.value);

  return (
    <TabContent.Container>
      <TabContent.Body>
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
      </TabContent.Body>
    </TabContent.Container>
  );
};
