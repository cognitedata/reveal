/*!
 * Copyright 2022 Cognite AS
 */

export type Class = {
  name: string;
  code: number;
  rgb: string;
};

export type ClassificationSet = {
  name: string;
  classificationSet: Class[];
};

export type ClassificationInfo = {
  classificationSets: ClassificationSet[];
};
