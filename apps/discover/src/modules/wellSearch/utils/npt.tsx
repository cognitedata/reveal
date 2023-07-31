import { getCodeDefinition } from 'domain/wells/npt/internal/selectors/getCodeDefinition';
import {
  NptCodeDefinitionType,
  NptCodeDetailsDefinitionType,
} from 'domain/wells/npt/NptCodeDefinitionType';

import { MultiSelectOptionObject } from 'components/Filters/types';
import { Definition } from 'pages/authorized/search/well/inspect/modules/nptEvents/components/Definition';
import { NoCodeDefinition } from 'pages/authorized/search/well/inspect/modules/nptEvents/components/NoCodeDefinition';

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
