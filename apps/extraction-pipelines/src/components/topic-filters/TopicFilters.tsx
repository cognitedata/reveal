import React, { useState } from 'react';

import styled from 'styled-components';

import { Body, Button, Flex, Heading, Icon } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { MQTTSourceWithJobMetrics } from '../../hooks/hostedExtractors';
import { CreateJobsModal } from '../create-jobs-modal/CreateJobsModal';
import Section from '../section';

import { TopicFilter } from './TopicFilter';

type TopicFiltersProps = {
  className?: string;
  source: MQTTSourceWithJobMetrics;
};

export const TopicFilters = ({
  className,
  source,
}: TopicFiltersProps): React.JSX.Element => {
  const { t } = useTranslation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <Section
      className={className}
      extra={
        source.jobs.length !== 0 && (
          <Button
            size="small"
            onClick={() => setIsCreateModalOpen(true)}
            type="ghost-accent"
          >
            {t('add-topic-filters')}
          </Button>
        )
      }
      icon="BarChart"
      title={t('topic-filter', { count: 2 })}
    >
      {isCreateModalOpen && (
        <CreateJobsModal
          onCancel={() => setIsCreateModalOpen(false)}
          source={source}
          visible={isCreateModalOpen}
        />
      )}
      <Content>
        {source.jobs.length ? (
          source.jobs.map((job) => (
            <TopicFilter key={job.externalId} job={job} />
          ))
        ) : (
          <EmptyContent>
            <Flex alignItems="center" direction="column" gap={8}>
              <Icon size={24} type="ListSearch" />
              <Flex alignItems="center" direction="column" gap={2}>
                <Heading level={5}>{t('no-data-topic-filters')}</Heading>
                <Body size="medium" muted>
                  {t('setup-stream-to-get-data-in')}
                </Body>
              </Flex>
            </Flex>
            <Button onClick={() => setIsCreateModalOpen(true)} type="primary">
              {t('setup-stream')}
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
  gap: 24px;
  flex-direction: column;
  padding: 16px;
`;
