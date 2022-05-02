import { EntityFeedbackModalState } from './types';

export const getDerivedState = ({
  isIncorrectDocType,
  correctDocType,
  isSensitiveData,
  isIncorrectGeo,
  isOther,
  freeText,
}: EntityFeedbackModalState) => {
  const isCorrectDocTypeSelected = isIncorrectDocType && !!correctDocType;

  const isAnyFeedbackTypeExist =
    isSensitiveData ||
    isIncorrectGeo ||
    isCorrectDocTypeSelected ||
    isOther ||
    !!freeText;

  return { isCorrectDocTypeSelected, isAnyFeedbackTypeExist };
};
