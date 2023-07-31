import { useCasingSchematicsWithTvdDataQuery } from 'domain/wells/casings/internal/queries/useCasingSchematicsWithTvdDataQuery';
import { sortCasingAssembliesByMDBase } from 'domain/wells/casings/internal/transformers/sortCasingAssembliesByMDBase';
import { useWellInspectWellbores } from 'domain/wells/well/internal/hooks/useWellInspectWellbores';
import { useParentWellboreIds } from 'domain/wells/wellbore/internal/hooks/useParentWellboreIds';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { useMemo } from 'react';

import differenceBy from 'lodash/differenceBy';
import isEmpty from 'lodash/isEmpty';

import { EMPTY_ARRAY, EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

import { CasingAssemblyView } from '../types';
import { adaptToCasingsColumnData } from '../utils/adaptToCasingsColumnData';

export const useCasingsData = () => {
  const wellbores = useWellInspectWellbores();
  const wellInspectWellboreIds = useWellInspectWellboreIds();

  const { data: parentWellboreIds, isLoading: isParentWellboreIdsLoading } =
    useParentWellboreIds(wellbores);

  const wellboreIds = useMemo(() => {
    if (isParentWellboreIdsLoading) {
      return EMPTY_ARRAY;
    }
    return [
      ...wellInspectWellboreIds,
      ...Object.values(parentWellboreIds).flat(),
    ];
  }, [wellInspectWellboreIds, parentWellboreIds]);

  const { data, isLoading } = useCasingSchematicsWithTvdDataQuery({
    wellboreIds,
  });

  return useDeepMemo(() => {
    if (!data || isEmpty(data)) {
      return {
        data: EMPTY_OBJECT as Record<string, CasingAssemblyView[]>,
        isLoading: isLoading || isParentWellboreIdsLoading,
      };
    }

    const adaptedData = adaptToCasingsColumnData(data);
    const groupedData = groupByWellbore(adaptedData);

    const casingsData = wellInspectWellboreIds.reduce((result, wellboreId) => {
      const parentIds = parentWellboreIds[wellboreId] || EMPTY_ARRAY;
      const casingAssemblies = groupedData[wellboreId] || EMPTY_ARRAY;

      const parentCasingAssemblies = parentIds.flatMap((parentId) => {
        return groupedData[parentId] || EMPTY_ARRAY;
      });

      const wellboreCasingAssemblies = differenceBy(
        casingAssemblies,
        parentCasingAssemblies,
        'minOutsideDiameter.value'
      );

      return {
        ...result,
        [wellboreId]: sortCasingAssembliesByMDBase([
          ...wellboreCasingAssemblies,
          ...parentCasingAssemblies,
        ]),
      };
    }, {} as Record<string, CasingAssemblyView[]>);

    return {
      data: casingsData,
      isLoading: false,
    };
  }, [data, isLoading, isParentWellboreIdsLoading]);
};
