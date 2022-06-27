import { getCodeDefinition } from 'domain/wells/npt/internal/selectors/getCodeDefinition';

import { MultiSelectOptionObject } from 'components/Filters/types';
import { Definition } from 'pages/authorized/search/well/inspect/modules/nptEvents/components/Definition';
import { NoCodeDefinition } from 'pages/authorized/search/well/inspect/modules/nptEvents/components/NoCodeDefinition';
import {
  NptCodeDefinitionType,
  NptCodeDetailsDefinitionType,
} from 'pages/authorized/search/well/inspect/modules/nptEvents/types';

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
