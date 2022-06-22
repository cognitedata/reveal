import { WellEventLegend } from '@cognite/discover-api-types';

import { NptCodeDefinitionType } from 'pages/authorized/search/well/inspect/modules/nptEvents/types';

export const mapNptCodeAndDetailCode = (legendCodes?: WellEventLegend[]) => {
  if (!legendCodes) return {};

  return legendCodes.reduce((codeDefinition, legendCode) => {
    if (legendCode.id && legendCode.legend) {
      return { ...codeDefinition, [legendCode.id]: legendCode.legend };
    }
    return codeDefinition;
  }, {} as NptCodeDefinitionType);
};
