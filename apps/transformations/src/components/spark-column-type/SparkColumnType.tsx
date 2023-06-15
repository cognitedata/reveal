import { Schema } from '@transformations/types';
import { getSparkColumnType } from '@transformations/utils';

import { Tooltip } from '@cognite/cogs.js';

type SparkColumnTypeProps = {
  schema: Schema;
};

const SparkColumnType = ({ schema }: SparkColumnTypeProps): JSX.Element => {
  const type = getSparkColumnType(schema.type);

  if (typeof schema.type === 'string') {
    return <>{type}</>;
  }

  return (
    <Tooltip content={schema.sqlType}>
      <>{type}</>
    </Tooltip>
  );
};

export default SparkColumnType;
