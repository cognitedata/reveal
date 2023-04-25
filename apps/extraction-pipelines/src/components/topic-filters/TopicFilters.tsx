import React from 'react';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import Section from 'components/section';
import { MQTTSourceWithJobMetrics } from 'hooks/hostedExtractors';

import { TopicFilter } from './TopicFilter';

type TopicFiltersProps = {
  className?: string;
  source: MQTTSourceWithJobMetrics;
};

export const TopicFilters = ({
  className,
  source,
}: TopicFiltersProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Section
      className={className}
      extra={
        <Button size="small" type="primary">
          {t('add-topic-filter')}
        </Button>
      }
      icon="Columns"
      title={t('topic-filter', { count: 2 })}
    >
      {source.jobs.map((job) => (
        <TopicFilter key={job.externalId} job={job} />
      ))}
    </Section>
  );
};
