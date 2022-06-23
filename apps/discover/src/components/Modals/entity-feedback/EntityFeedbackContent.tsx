import React, { useEffect, useState, useMemo } from 'react';

import { Checkbox, OptionType } from '@cognite/cogs.js';
import { DocumentPayload } from '@cognite/discover-api-types';

import { useTranslation } from 'hooks/useTranslation';

import {
  FEEDBACK_ACTION_TITLE,
  FEEDBACK_AGREEMENT,
  ADDITIONAL_FEEDBACK_TITLE,
  FEEDBACK_INPUT_PLACEHOLDER,
  FEEDBACK_INTRO_TEXT,
  IMMINENT_REMOVE_NOTE,
  INCORRECT_DOCUMENT_TYPE_CHECKBOX_LABEL,
  INCORRECT_GEO_CHECKBOX_LABEL,
  CURRENT_DOCUMENT_TYPE,
  UNCLASSIFIED_DOCUMENT_TYPE,
  CORRECT_DOCUMENT_TYPE_SELECTOR_PLACEHOLDER,
  ONLY_BY_ADMIN,
  OTHER_CHECKBOX_LABEL,
  SENSITIVE_DATA_CHECKBOX_LABEL,
} from '../constants';

import {
  FeedbackIntroTitle,
  ImminentRemoveNote,
  FeedbackActionTitle,
  TinyText,
  CurrentDocumentTypeText,
  CorrectDocumentTypeSelect,
  AdditionalFeedback,
  FeedbackAgreement,
  OnlyByAdminText,
  ItemRow,
} from './elements';
import { Field } from './types';

export interface Props {
  handleCheckChanged: (field: Field, isSelected: boolean) => void;
  isSensitiveData: boolean;
  isIncorrectGeo: boolean;
  isIncorrectDocType: boolean;
  isOther: boolean;
  freeText: string;
  currentDocumentType: string;
  documentTypes: DocumentPayload[];
  handleSetCorrectDocumentType: (event: {
    label: string;
    value?: string;
  }) => void;
  handleTextChanged: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const EntityFeedbackContent: React.FC<Props> = (props) => {
  const {
    handleCheckChanged,
    isSensitiveData,
    isIncorrectGeo,
    isIncorrectDocType,
    isOther,
    freeText,
    documentTypes,
    currentDocumentType,
    handleSetCorrectDocumentType,
    handleTextChanged,
  } = props;

  const { t } = useTranslation('feedback');
  const [documentTypeDropdownValue, setDocumentTypeDropdownValue] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!isIncorrectDocType) setDocumentTypeDropdownValue(undefined);
  }, [isIncorrectDocType]);

  const documentTypesOptions: OptionType<string>[] = useMemo(
    () =>
      documentTypes
        .filter((docType) => docType.name !== currentDocumentType)
        .map((docType) => ({ label: docType.name, value: docType.id })),
    [documentTypes, currentDocumentType]
  );

  const handleChangeDocumentTypeSelectDropdown = (
    selected: OptionType<string>
  ) => {
    const { label, value } = selected;
    setDocumentTypeDropdownValue(value);
    handleSetCorrectDocumentType({ value, label });
  };

  return (
    <>
      <ImminentRemoveNote
        data-testid="imminent-remove-note"
        visible={isSensitiveData}
      >
        {t(IMMINENT_REMOVE_NOTE)}
      </ImminentRemoveNote>

      <FeedbackIntroTitle>{t(FEEDBACK_INTRO_TEXT)}</FeedbackIntroTitle>

      <FeedbackActionTitle variant="body2">
        {t(FEEDBACK_ACTION_TITLE)}
      </FeedbackActionTitle>

      <ItemRow>
        <Checkbox
          id="feedback-sensitiveData"
          data-testid="sensitive-data-checkbox"
          checked={isSensitiveData}
          onChange={() =>
            handleCheckChanged('isSensitiveData', !isSensitiveData)
          }
          name={t(SENSITIVE_DATA_CHECKBOX_LABEL)}
        >
          {t(SENSITIVE_DATA_CHECKBOX_LABEL)}
        </Checkbox>
      </ItemRow>

      <ItemRow>
        <Checkbox
          id="feedback-incorrectGeo"
          data-testid="incorrect-geo-checkbox"
          checked={isIncorrectGeo}
          onChange={() => handleCheckChanged('isIncorrectGeo', !isIncorrectGeo)}
          name={t(INCORRECT_GEO_CHECKBOX_LABEL)}
        >
          {t(INCORRECT_GEO_CHECKBOX_LABEL)}
        </Checkbox>
      </ItemRow>

      <ItemRow>
        <Checkbox
          id="feedback-incorrectDocType"
          data-testid="feedback-incorrectdoctype-checkbox"
          checked={isIncorrectDocType}
          onChange={() =>
            handleCheckChanged('isIncorrectDocType', !isIncorrectDocType)
          }
          name={t(INCORRECT_DOCUMENT_TYPE_CHECKBOX_LABEL)}
        >
          {t(INCORRECT_DOCUMENT_TYPE_CHECKBOX_LABEL)}{' '}
        </Checkbox>

        {isIncorrectDocType && (
          <>
            <TinyText variant="tinytext">
              {t(CURRENT_DOCUMENT_TYPE)}:{' '}
              <CurrentDocumentTypeText stale={documentTypeDropdownValue}>
                {currentDocumentType
                  ? `"${currentDocumentType}"`
                  : UNCLASSIFIED_DOCUMENT_TYPE}
              </CurrentDocumentTypeText>
            </TinyText>

            <CorrectDocumentTypeSelect
              placeholder={CORRECT_DOCUMENT_TYPE_SELECTOR_PLACEHOLDER}
              options={documentTypesOptions}
              onChange={handleChangeDocumentTypeSelectDropdown}
            />
          </>
        )}
      </ItemRow>

      <ItemRow>
        <Checkbox
          id="feedback-other"
          data-testid="feedback-other-checkbox"
          checked={isOther}
          onChange={() => handleCheckChanged('isOther', !isOther)}
          name={t(OTHER_CHECKBOX_LABEL)}
        >
          {t(OTHER_CHECKBOX_LABEL)}
        </Checkbox>
      </ItemRow>

      <AdditionalFeedback
        id="feedback-text"
        data-testid="feedback-text"
        title={ADDITIONAL_FEEDBACK_TITLE}
        value={freeText}
        placeholder={t(FEEDBACK_INPUT_PLACEHOLDER)}
        onChange={handleTextChanged}
      />

      <FeedbackAgreement>{t(FEEDBACK_AGREEMENT)}</FeedbackAgreement>

      <OnlyByAdminText>{t(ONLY_BY_ADMIN)}</OnlyByAdminText>
    </>
  );
};
