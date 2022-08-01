import React from 'react';

import { Icon, Colors } from '@cognite/cogs.js';

import Tooltip from 'components/Tooltip/Tooltip';
import { useActiveTableContext } from 'contexts';
import {
  FULL_PROFILE_LIMIT,
  useFullProfile,
  Profile,
} from 'hooks/profiling-service';
import { useTranslation } from 'common/i18n';

export default function RowCount() {
  const { t } = useTranslation();
  const { database, table } = useActiveTableContext();
  const { data = {}, isFetched } = useFullProfile({
    database,
    table,
  });

  const { rowCount = undefined, isComplete = false } = data as Profile;

  const isPartialProfiling =
    rowCount === FULL_PROFILE_LIMIT || (isFetched && !isComplete);

  if (!isFetched) {
    return (
      <Icon
        type="Loader"
        style={{
          color: Colors['greyscale-grey4'].hex(),
          margin: '0 5px',
        }}
      />
    );
  }

  if (!Number.isFinite(rowCount)) {
    return null;
  }
  if (isPartialProfiling) {
    const fixedRowCount =
      rowCount && rowCount < FULL_PROFILE_LIMIT ? rowCount : t('1-million');
    const fixedRowCountAbbreviated = `>
      ${rowCount && rowCount < FULL_PROFILE_LIMIT ? rowCount : t('1M')}`;
    return (
      <Tooltip
        placement="bottom"
        content={t('profiling-row-count-tooltip', { number: fixedRowCount })}
      >
        <>{fixedRowCountAbbreviated}</>
      </Tooltip>
    );
  }
  return <>{t('n-rows', { count: rowCount })}</>;
}
