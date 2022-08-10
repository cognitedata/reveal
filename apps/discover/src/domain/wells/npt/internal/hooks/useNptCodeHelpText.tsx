import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboreIds';

import { useMemo } from 'react';

import { useNptEventsQuery } from '../queries/useNptEventsQuery';
import { getCodeDefinition } from '../selectors/getCodeDefinition';

import { useNptDefinitions } from './useNptDefinitions';

export type NptCodeHelpText = Record<string, string | undefined>;

export const useNptCodeHelpText = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const { nptCodeDefinitions } = useNptDefinitions();

  const { data } = useNptEventsQuery({ wellboreIds });

  return useMemo(() => {
    if (data === undefined) {
      return {};
    }

    return data?.reduce((accumulator, { nptCode }) => {
      const codeDefinition: string = getCodeDefinition(
        nptCode,
        nptCodeDefinitions
      );

      return { ...accumulator, [nptCode]: codeDefinition };
    }, {} as NptCodeHelpText);
  }, [data, nptCodeDefinitions]);
};
