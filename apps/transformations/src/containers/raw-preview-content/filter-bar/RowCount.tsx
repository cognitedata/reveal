import { useTranslation } from '@transformations/common/i18n';
import Tooltip from '@transformations/components/tooltip';
import {
  FULL_PROFILE_LIMIT,
  useFullProfile,
  Profile,
} from '@transformations/hooks/profiling-service';

import { Icon, Colors } from '@cognite/cogs.js';

type RowCountProps = {
  database: string;
  table: string;
};

export default function RowCount({ database, table }: RowCountProps) {
  const { t } = useTranslation();
  const { data = {}, isFetched } = useFullProfile({
    database,
    table,
  });

  const { rowCount = undefined, isComplete = false } = data as Profile;

  const isPartialProfiling =
    rowCount === FULL_PROFILE_LIMIT || (isFetched && !isComplete);

  if (!isFetched) {
    return (
      <span
        style={{
          color: Colors['decorative--grayscale--400'],
          margin: '0 5px',
        }}
      >
        <Icon type="Loader" />
      </span>
    );
  }

  if (!Number.isFinite(rowCount)) {
    return null;
  }
  if (isPartialProfiling) {
    const fixedRowCount =
      rowCount && rowCount < FULL_PROFILE_LIMIT ? rowCount : '1 million';
    const fixedRowCountAbbreviated = `>
      ${rowCount && rowCount < FULL_PROFILE_LIMIT ? rowCount : '1M'}`;
    return (
      <Tooltip
        placement="bottom"
        content={t('fixed-row-count', { fixedRowCount })}
      >
        <>{fixedRowCountAbbreviated}</>
      </Tooltip>
    );
  }
  return (
    <>
      {t('rows')}&nbsp;:&nbsp;{rowCount}
    </>
  );
}
