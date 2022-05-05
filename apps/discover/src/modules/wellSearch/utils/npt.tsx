import { getCodeDefinition } from 'dataLayers/wells/npt/selectors/getCodeDefinition';

import { MultiSelectOptionObject } from 'components/Filters/types';
import { Definition } from 'pages/authorized/search/well/inspect/modules/events/Npt/Definition';
import { NoCodeDefinition } from 'pages/authorized/search/well/inspect/modules/events/Npt/NoCodeDefinition';
import {
  NptCodeDefinitionType,
  NptCodeDetailsDefinitionType,
} from 'pages/authorized/search/well/inspect/modules/events/Npt/types';

export const nptDataMapToMultiSelect = (
  codeList: string[],
  definitionList?: NptCodeDefinitionType | NptCodeDetailsDefinitionType
) => {
  return codeList.reduce(
    (optionList: MultiSelectOptionObject[], code) => {
      const codeDefinition: string = getCodeDefinition(code, definitionList);

      return [
        ...optionList,
        {
          value: code,
          helpText: codeDefinition ? (
            <Definition definition={codeDefinition} />
          ) : (
            <NoCodeDefinition />
          ),
        },
      ];
    },

    []
  );
};
