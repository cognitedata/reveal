import React from 'react';

import { createLink } from '@cognite/cdf-utilities';
import { Icon, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import Link from 'components/link';
import { useDataSet } from 'hooks/useDataSets';

type DataSetLinkProps = {
  dataSetId: number;
};

const DataSetLink = ({ dataSetId }: DataSetLinkProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: dataSet, isLoading, isError, error } = useDataSet(dataSetId);

  const body = (
    <>
      {isLoading && <Icon type="Loader" />}
      <Link to={createLink(`/data-sets/data-set/${dataSetId}`)}>
        {dataSet ? dataSet?.name || dataSet?.externalId : dataSetId}
      </Link>
    </>
  );

  if (isError) {
    switch (error) {
      case 403:
        return <Tooltip content={t('data-set-403')}>{body}</Tooltip>;
      default:
        return <Tooltip content={t('data-set-generic-error')}>{body}</Tooltip>;
    }
  }

  return body;
};

export default DataSetLink;
