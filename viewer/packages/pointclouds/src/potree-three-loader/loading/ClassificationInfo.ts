/*!
 * Copyright 2022 Cognite AS
 */

export type PointClass = {
  name: string;
  code: number;
  rgb?: string;
};

export type ClassificationSet = {
  name: string;
  classificationSet: PointClass[];
};

export type ClassificationInfo = {
  classificationSets: ClassificationSet[];
};
