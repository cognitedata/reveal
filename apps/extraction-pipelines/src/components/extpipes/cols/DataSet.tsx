import React from 'react';

import { useTranslation } from '@extraction-pipelines/common';
import Link from '@extraction-pipelines/components/links/Link';
import { useDataSet } from '@extraction-pipelines/hooks/dataSet';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Icon, Tooltip } from '@cognite/cogs.js';

type Props = {
  dataSetId: number;
};

export const DataSet = ({ dataSetId }: Props) => {
  const { t } = useTranslation();
  const {
    data: dataSet,
    isInitialLoading,
    isError,
    error,
  } = useDataSet(dataSetId);

  const body = (
    <>
      {isInitialLoading && <Icon type="Loader" />}
      <Body level={2} strong>
        <Link to={createLink(`/data-sets/data-set/${dataSetId}`)}>
          {dataSet ? dataSet?.name || dataSet?.externalId : dataSetId}
        </Link>
      </Body>
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
