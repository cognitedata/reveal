import { filterNotAssignedDocumentTypes } from 'domain/feedback/utils/filterNotAssignedDocumentTypes';

import React, { useEffect, useState, useMemo } from 'react';

import { Checkbox, OptionType } from '@cognite/cogs.js';
import { DocumentPayload } from '@cognite/discover-api-types';

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
  handleCheckChanged?: (field: Field, isSelected: boolean) => void;
  isSensitiveData: boolean;
  isIncorrectGeo: boolean;
  isIncorrectDocType: boolean;
  isOther: boolean;
  freeText: string;
  currentDocumentType: string[];
  documentTypes: DocumentPayload[];
  handleSetCorrectDocumentType?: (event: {
    label: string;
    value?: string;
  }) => void;
  handleTextChanged?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const EntityFeedbackContent: React.FC<Props> = React.memo((props) => {
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

  // causing issues with react modal and react 18, so disabled.
  // const { t } = useTranslation('feedback');
  const [documentTypeDropdownValue, setDocumentTypeDropdownValue] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!isIncorrectDocType) {
      setDocumentTypeDropdownValue(undefined);
    }
  }, [isIncorrectDocType]);

  const documentTypesOptions: OptionType<string>[] = useMemo(
    () =>
      filterNotAssignedDocumentTypes(documentTypes, currentDocumentType).map(
        (docType) => ({
          label: docType.name,
          value: docType.id,
        })
      ),
    [documentTypes, currentDocumentType]
  );

  const handleChangeDocumentTypeSelectDropdown = (
    selected: OptionType<string>
  ) => {
    const { label, value } = selected;
    setDocumentTypeDropdownValue(value);
    handleSetCorrectDocumentType?.({ value, label });
  };

  return (
    <>
      <ImminentRemoveNote
        data-testid="imminent-remove-note"
        visible={isSensitiveData}
      >
        {IMMINENT_REMOVE_NOTE}
      </ImminentRemoveNote>

      <FeedbackIntroTitle>{FEEDBACK_INTRO_TEXT}</FeedbackIntroTitle>

      <FeedbackActionTitle variant="body2">
        {FEEDBACK_ACTION_TITLE}
      </FeedbackActionTitle>

      <ItemRow>
        <Checkbox
          id="feedback-sensitiveData"
          data-testid="sensitive-data-checkbox"
          checked={isSensitiveData}
          onChange={() =>
            handleCheckChanged?.('isSensitiveData', !isSensitiveData)
          }
          name={SENSITIVE_DATA_CHECKBOX_LABEL}
        >
          {SENSITIVE_DATA_CHECKBOX_LABEL}
        </Checkbox>
      </ItemRow>

      <ItemRow>
        <Checkbox
          id="feedback-incorrectGeo"
          data-testid="incorrect-geo-checkbox"
          checked={isIncorrectGeo}
          onChange={() =>
            handleCheckChanged?.('isIncorrectGeo', !isIncorrectGeo)
          }
          name={INCORRECT_GEO_CHECKBOX_LABEL}
        >
          {INCORRECT_GEO_CHECKBOX_LABEL}
        </Checkbox>
      </ItemRow>

      <ItemRow>
        <Checkbox
          id="feedback-incorrectDocType"
          data-testid="feedback-incorrectdoctype-checkbox"
          checked={isIncorrectDocType}
          onChange={() =>
            handleCheckChanged?.('isIncorrectDocType', !isIncorrectDocType)
          }
          name={INCORRECT_DOCUMENT_TYPE_CHECKBOX_LABEL}
        >
          {INCORRECT_DOCUMENT_TYPE_CHECKBOX_LABEL}{' '}
        </Checkbox>
        {isIncorrectDocType && (
          <>
            <TinyText variant="tinytext">
              {CURRENT_DOCUMENT_TYPE}:{' '}
              <CurrentDocumentTypeText stale={documentTypeDropdownValue}>
                {currentDocumentType?.length > 0
                  ? `"${currentDocumentType.join(', ')}"`
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
          onChange={() => handleCheckChanged?.('isOther', !isOther)}
          name={OTHER_CHECKBOX_LABEL}
        >
          {OTHER_CHECKBOX_LABEL}
        </Checkbox>
      </ItemRow>

      <AdditionalFeedback
        id="feedback-text"
        data-testid="feedback-text"
        title={ADDITIONAL_FEEDBACK_TITLE}
        value={freeText}
        placeholder={FEEDBACK_INPUT_PLACEHOLDER}
        onChange={handleTextChanged}
      />

      <FeedbackAgreement>{FEEDBACK_AGREEMENT}</FeedbackAgreement>

      <OnlyByAdminText>{ONLY_BY_ADMIN}</OnlyByAdminText>
    </>
  );
});
