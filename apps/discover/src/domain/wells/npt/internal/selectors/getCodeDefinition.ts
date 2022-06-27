import {
  NptCodeDefinitionType,
  NptCodeDetailsDefinitionType,
} from 'pages/authorized/search/well/inspect/modules/nptEvents/types';

export const getCodeDefinition = (
  code?: string,
  definitionList?: NptCodeDefinitionType | NptCodeDetailsDefinitionType
) => {
  return code && definitionList?.[code] ? definitionList[code] : '';
};
