import React from 'react';

import styled from 'styled-components';

import { Colors, Title, Detail } from '@cognite/cogs.js';

import { Flex, DoughnutChart } from '../../../components/Common';
import { progressData } from '../../../components/Filters';
import { useResourceCount, useParsingJob } from '../../../hooks';
import { ApiStatusCount } from '../../../modules/types';
import StatusSquare from '../StatusSquare';

const SectionProgress = (): JSX.Element => {
  const { diagrams: total = 0 } = useResourceCount();
  const { statusCount: parsingJobStatusCount = {} } = useParsingJob();
  const progressCount = {
    completed: 0,
    running: 0,
    queued: 0,
    failed: 0,
    ...parsingJobStatusCount,
  };

  const successPercentage = total
    ? Math.ceil((100 * progressCount.completed) / total)
    : 0;
  const idle =
    (total -
      (progressCount.completed +
        progressCount.running +
        progressCount.queued +
        progressCount.failed)) /
    total;

  const data = {
    labels: progressData.map((progress) => progress.label),
    datasets: [
      {
        data: progressData.map((progress) => {
          const statusProgress =
            progress.type === 'idle' ? idle : progressCount?.[progress.type];
          const progressPercentage =
            total === 0 ? 0 : 100 * ((statusProgress ?? 0) / total);
          return progressPercentage;
        }),
        backgroundColor: progressData.map((progress) => progress.color),
      },
    ],
  };

  return (
    <Wrapper>
      <DoughnutChart
        data={data}
        label={
          <Flex column align justify>
            <Title level={3} style={{ fontWeight: 700 }}>
              {successPercentage}%
            </Title>
            <Detail
              style={{
                textAlign: 'center',
                color: Colors['decorative--grayscale--600'],
              }}
            >
              processed successfully
            </Detail>
          </Flex>
        }
      />
      <Flex column justify style={{ alignItems: 'flex-start' }}>
        {progressData
          .filter((progress) => progress.type && progress.type !== 'idle')
          .map((progress) => (
            <StatusSquare
              key={`status-square-${progress.type}`}
              small
              status={progress.type}
              style={{ margin: '6px' }}
              hoverContent={`${
                progressCount?.[progress.type as keyof ApiStatusCount]
              } diagram(s) ${progress.type}`}
            />
          ))}
      </Flex>
    </Wrapper>
  );
};

export default React.memo(SectionProgress);

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 28px;
  margin: 0;
  font-family: 'Inter';
  min-width: 340px;
  max-width: 340px;
  border: 1px solid ${Colors['decorative--grayscale--400']};
  border-radius: 8px;
  box-sizing: border-box;
`;
