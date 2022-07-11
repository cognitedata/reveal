import { NptCodeDefinitionType, NptCodeDetailsDefinitionType } from '../types';

export const getCodeDefinition = (
  code?: string,
  definitionList?: NptCodeDefinitionType | NptCodeDetailsDefinitionType
) => {
  return code && definitionList?.[code] ? definitionList[code] : '';
};
