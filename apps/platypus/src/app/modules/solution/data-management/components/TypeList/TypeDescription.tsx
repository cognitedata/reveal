import { DataModelTypeDefsType } from '@platypus/platypus-core';
import useSelector from '@platypus-app/hooks/useSelector';

import { Detail } from '@cognite/cogs.js';
import { useManualPopulationFeatureFlag } from '@platypus-app/flags';
import * as S from './elements';

export type TypeDescriptionProps = {
  dataModelType: DataModelTypeDefsType;
  publishedRowsCount: number;
  isLoading: boolean;
};

export const TypeDescription: React.FC<TypeDescriptionProps> = ({
  dataModelType,
  publishedRowsCount,
  isLoading,
}) => {
  const { isEnabled: isManualPopulationEnabled } =
    useManualPopulationFeatureFlag();
  const draftRowsData = useSelector(
    (state) => state.dataManagement.draftRows[dataModelType.name || ''] || []
  );

  const description = `${publishedRowsCount} instance${
    publishedRowsCount > 1 ? 's' : ''
  } ${
    isManualPopulationEnabled
      ? `/ ${draftRowsData.length} draft${draftRowsData.length > 1 ? 's' : ''}`
      : ''
  }`;
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
