import { useTranslation } from '@extraction-pipelines/common';
import { ErrorBox } from '@extraction-pipelines/components/error/ErrorBox';
import { ErrorFeedback as ErrorFeedback_ } from '@extraction-pipelines/components/error/ErrorFeedback';
import { PageWrapperColumn } from '@extraction-pipelines/components/styled/StyledPage';
import { useRunFilterContext } from '@extraction-pipelines/hooks/runs/RunsFilterContext';
import { useRuns } from '@extraction-pipelines/hooks/useRuns';
import React from 'react';
import { DEFAULT_ITEMS_PER_PAGE } from '@extraction-pipelines/utils/constants';
import { isForbidden } from '@extraction-pipelines/utils/utils';

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
