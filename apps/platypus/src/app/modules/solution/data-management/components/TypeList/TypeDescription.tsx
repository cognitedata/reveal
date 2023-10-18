import { useMemo } from 'react';

import { DataModelTypeDefsType } from '@fusion/data-modeling';

import { Detail } from '@cognite/cogs.js';

import { useManualPopulationFeatureFlag } from '../../../../../flags';
import useSelector from '../../../../../hooks/useSelector';
import { useGetFilteredRowsCount } from '../../hooks/useGetFilteredRowsCount';
import { usePublishedRowsCountMapByType } from '../../hooks/usePublishedRowsCountMapByType';

import * as S from './elements';

export const TypeDescription = ({
  dataModelType,
}: {
  dataModelType: DataModelTypeDefsType;
}) => {
  const { data: publishedRowsCountMap = {}, isLoading } =
    usePublishedRowsCountMapByType();
  const { isEnabled: isManualPopulationEnabled } =
    useManualPopulationFeatureFlag();
  const draftRowsData = useSelector(
    (state) => state.dataManagement.draftRows[dataModelType?.name || ''] || []
  );
  const filteredRowsCount = useGetFilteredRowsCount();

  const activeRowsCount =
    filteredRowsCount !== null && filteredRowsCount !== undefined
      ? filteredRowsCount
      : publishedRowsCountMap[dataModelType?.name || ''];

  const description = useMemo(
    () =>
      `${activeRowsCount} instance${activeRowsCount > 1 ? 's' : ''} ${
        isManualPopulationEnabled
          ? `/ ${draftRowsData.length} draft${
              draftRowsData.length > 1 ? 's' : ''
            }`
          : ''
      }`,
    [activeRowsCount, draftRowsData.length, isManualPopulationEnabled]
  );
  return isLoading ? (
    <S.StyledSkeleton />
  ) : (
    <Detail as="div">{description}</Detail>
  );
};

/*
    TODO: switch out the description variable with the below translated instance.
    when useTranslation is implemented properly.
    {t(
    'description',
    '{{ publishedRowCount }} instances / {{ draftRowsCount }} drafts',
    {
        publishedRowsCount: publishedRowsCount ? publishedRowsCount : 0,
        draftRowsCount: draftRowsData.length,
    }
    )}
*/
