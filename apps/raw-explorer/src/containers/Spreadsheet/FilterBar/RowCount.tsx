import React from 'react';

import { useTranslation } from '@raw-explorer/common/i18n';
import Tooltip from '@raw-explorer/components/Tooltip/Tooltip';
import { useActiveTableContext } from '@raw-explorer/contexts';
import {
  FULL_PROFILE_LIMIT,
  useFullProfile,
  Profile,
} from '@raw-explorer/hooks/profiling-service';

import { Icon, Colors } from '@cognite/cogs.js';

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
        css={{
          color: Colors['text-icon--muted'],
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
