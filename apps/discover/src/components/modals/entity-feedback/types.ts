export type Field =
  | 'isSensitiveData'
  | 'isIncorrectGeo'
  | 'isOther'
  | 'isIncorrectDocType';

export type EntityFeedbackModalState = {
  isIncorrectDocType: boolean;
  correctDocType: string;
  isSensitiveData: boolean;
  isIncorrectGeo: boolean;
  isOther: boolean;
  freeText: string;
};
