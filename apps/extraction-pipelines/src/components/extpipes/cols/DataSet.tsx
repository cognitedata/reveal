import React from 'react';
import { useTranslation } from 'common';
import { useDataSet } from 'hooks/dataSet';
import { Body, Icon, Tooltip } from '@cognite/cogs.js';
import Link from 'components/links/Link';
import { createLink } from '@cognite/cdf-utilities';

type Props = {
  dataSetId: number;
};

export const DataSet = ({ dataSetId }: Props) => {
  const { t } = useTranslation();
  const { data: dataSet, isLoading, isError, error } = useDataSet(dataSetId);

  const body = (
    <>
      {isLoading && <Icon type="Loader" />}
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
