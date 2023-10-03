import { Link } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';
import { Icon } from '@cognite/cogs.js';

import { useDataSet } from '../../hooks/dataset';

type QuickMatchDataSetProps = {
  dataSetId: number;
};

const QuickMatchDataSet = ({
  dataSetId,
}: QuickMatchDataSetProps): JSX.Element => {
  const { data: dataSet, isInitialLoading } = useDataSet(dataSetId);

  return (
    <>
      {isInitialLoading && <Icon type="Loader" />}
      <Link to={createLink(`/data-sets/data-set/${dataSetId}`)}>
        {dataSet ? dataSet?.name || dataSet?.externalId : dataSetId}
      </Link>
    </>
  );
};

export default QuickMatchDataSet;
