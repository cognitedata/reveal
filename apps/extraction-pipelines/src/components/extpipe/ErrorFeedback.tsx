import { useTranslation } from 'common';
import { ErrorBox } from 'components/error/ErrorBox';
import { ErrorFeedback as ErrorFeedback_ } from 'components/error/ErrorFeedback';
import { PageWrapperColumn } from 'components/styled/StyledPage';
import { useRunFilterContext } from 'hooks/runs/RunsFilterContext';
import { useRuns } from 'hooks/useRuns';
import React from 'react';
import { DEFAULT_ITEMS_PER_PAGE } from 'utils/constants';
import { isForbidden } from 'utils/utils';

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
