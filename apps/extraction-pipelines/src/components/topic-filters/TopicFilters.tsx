import React, { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import Section from 'components/section';
import { MQTTSourceWithJobMetrics } from 'hooks/hostedExtractors';

import { TopicFilter } from './TopicFilter';
import { CreateJobsModal } from 'components/create-jobs-modal/CreateJobsModal';
import styled from 'styled-components';

type TopicFiltersProps = {
  className?: string;
  source: MQTTSourceWithJobMetrics;
};

export const TopicFilters = ({
  className,
  source,
}: TopicFiltersProps): JSX.Element => {
  const { t } = useTranslation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <Section
      className={className}
      extra={
        <Button
          size="small"
          onClick={() => setIsCreateModalOpen(true)}
          type="primary"
        >
          {t('create-jobs')}
        </Button>
      }
      icon="Columns"
      title={t('topic-filter', { count: 2 })}
    >
      <CreateJobsModal
        onCancel={() => setIsCreateModalOpen(false)}
        source={source}
        visible={isCreateModalOpen}
      />
      <Content>
        {source.jobs.map((job) => (
          <TopicFilter key={job.externalId} job={job} />
        ))}
      </Content>
    </Section>
  );
};

const Content = styled.div`
  overflow-y: auto;
`;
