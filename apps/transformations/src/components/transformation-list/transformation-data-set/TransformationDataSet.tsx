import { useTranslation } from '@transformations/common';
import Link from '@transformations/components/link/Link';
import { useDataSet } from '@transformations/hooks';

import { createLink } from '@cognite/cdf-utilities';
import { Icon, Tooltip } from '@cognite/cogs.js';

type TransformationDataSetProps = {
  dataSetId: number;
};

const TransformationDataSet = ({
  dataSetId,
}: TransformationDataSetProps): JSX.Element => {
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

export default TransformationDataSet;
