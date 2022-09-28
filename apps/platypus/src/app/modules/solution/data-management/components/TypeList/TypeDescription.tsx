import { DataModelTypeDefsType } from '@platypus/platypus-core';
import useSelector from '@platypus-app/hooks/useSelector';

import { usePublishedRowsCount } from '../../hooks/usePublishedRowsCount';

import { Detail } from '@cognite/cogs.js';
import * as S from './elements';

export type TypeDescriptionProps = {
  dataModelType: DataModelTypeDefsType;
  dataModelExternalId: string;
};

export const TypeDescription: React.FC<TypeDescriptionProps> = ({
  dataModelType,
  dataModelExternalId,
}) => {
  const draftRowsData = useSelector(
    (state) => state.dataManagement.draftRows[dataModelType.name || ''] || []
  );
  const { data: publishedRowsCount = 0, isLoading } = usePublishedRowsCount({
    dataModelExternalId,
    dataModelType,
  });

  const description = `${publishedRowsCount} instance${
    publishedRowsCount > 1 ? 's' : ''
  } / ${draftRowsData.length} draft${draftRowsData.length > 1 ? 's' : ''}`;
  return isLoading ? (
    <S.StyledSkeleton />
  ) : (
    <Detail as="div" css>
      {description}
    </Detail>
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
