import React, { useState } from 'react';

import { Body, Button, Illustrations } from '@cognite/cogs.js';

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
        {source.jobs.length ? (
          source.jobs.map((job) => (
            <TopicFilter key={job.externalId} job={job} />
          ))
        ) : (
          <EmptyContent>
            <Illustrations.Solo type="ExtractorDataSources" />
            <Body level={3} muted>
              {t('create-jobs-to-start-listening-messages')}
            </Body>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              type="ghost-accent"
              size="small"
              icon="AddLarge"
            >
              {t('create-jobs')}
            </Button>
          </EmptyContent>
        )}
      </Content>
    </Section>
  );
};

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const EmptyContent = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: center;
  gap: 8px;
  flex-direction: column;
  padding: 16px;
`;
