export type Field =
  | 'isSensitiveData'
  | 'isIncorrectGeo'
  | 'isOther'
  | 'isIncorrectDocType';

export type EntityFeedbackModalState = {
  isIncorrectDocType: boolean;
  correctDocType: { label: string; value: string };
  isSensitiveData: boolean;
  isIncorrectGeo: boolean;
  isOther: boolean;
  freeText: string;
};
