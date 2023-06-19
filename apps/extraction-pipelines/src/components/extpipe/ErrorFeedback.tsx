import React from 'react';

import { useTranslation } from '../../common';
import { useRunFilterContext } from '../../hooks/runs/RunsFilterContext';
import { useRuns } from '../../hooks/useRuns';
import { DEFAULT_ITEMS_PER_PAGE } from '../../utils/constants';
import { isForbidden } from '../../utils/utils';
import { ErrorBox } from '../error/ErrorBox';
import { ErrorFeedback as ErrorFeedback_ } from '../error/ErrorFeedback';
import { PageWrapperColumn } from '../styled/StyledPage';

type ErrorMessageProps = {
  externalId: string;
};
export default function ErrorFeedback({ externalId }: ErrorMessageProps) {
  const { t } = useTranslation();

  const {
    state: { dateRange, statuses, search },
  } = useRunFilterContext();

  const { error } = useRuns({
    externalId,
    limit: DEFAULT_ITEMS_PER_PAGE,
    statuses,
    search,
    dateRange,
  });

  if (!error) {
    return null;
  }

  return !isForbidden(error.status) ? (
    <ErrorFeedback_ error={error} />
  ) : (
    <PageWrapperColumn>
      <ErrorBox heading={t('no-access')}>
        <p>
          {t('no-access-desc')}
          <code>extractionruns:read</code>.
        </p>
      </ErrorBox>
    </PageWrapperColumn>
  );
}
