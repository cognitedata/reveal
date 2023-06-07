import { useState } from 'react';

import styled from 'styled-components';

import { ExpandIcon } from '@charts-app/components/Common/SidebarElements';
import CopyButton from '@charts-app/components/CopyButton/CopyButton';
import { StyledModal } from '@charts-app/components/Modal/StyledModal';
import { HorizontalDivider } from '@charts-app/components/TopBar/elements';
import {
  formatDate,
  convertMillisecondsToDuration,
} from '@charts-app/utils/date';
import Layers from '@charts-app/utils/z-index';

import { Body, Flex, Collapse, Button, Icon, Title } from '@cognite/cogs.js';

import { useScheduledCalculationDataValue } from '../../../models/scheduled-calculation-results/atom';

import { StyledCollapse } from './elements';

const SummaryWrapper = styled.div`
  padding: 8px;
  border-radius: 6px;
  background-color: white;
  position: absolute;
  top: 5px;
  left: 140px;
  z-index: ${Layers.MINIMUM};
  display: flex;
  flex-direction: column;
  width: 333px;
`;

const DescriptionButtonContainer = styled.div`
  padding: 0 8px;
`;

const SummaryColorBar = styled.div`
  height: 4px;
  width: 100%;
  border-radius: 4px 4px 0 0;
  position: absolute;
  top: 0;
  left: 0;
`;

export const ScheduledCalculationSummary = ({
  workflowId,
  color,
}: {
  workflowId: string;
  color?: string;
}) => {
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const scheduledCalculationDataMap = useScheduledCalculationDataValue();
  const scheduledCalculationData = scheduledCalculationDataMap?.[workflowId];
  return (
    <SummaryWrapper className="z-8">
      <SummaryColorBar style={{ backgroundColor: color }} />
      <StyledCollapse
        ghost
        expandIcon={({ isActive }) => (
          <ExpandIcon
            $active={Boolean(isActive)}
            type="ChevronDownSmall"
            style={{ top: 16, position: 'absolute', right: 10 }}
          />
        )}
      >
        <Collapse.Panel
          key="scheduled-calc-summary"
          header={
            <Body strong level={3}>
              Saved result - details
            </Body>
          }
        >
          <Flex direction="column" gap={8}>
            <Flex alignItems="center">
              <Body level={3}>
                {`External ID: ${scheduledCalculationData?.externalId || '-'}`}{' '}
              </Body>
              <CopyButton
                value={scheduledCalculationData?.externalId}
                style={{ height: 28, padding: '4px 6px' }}
              />
            </Flex>

            <Body level={3}>{`Created: ${
              scheduledCalculationData?.createdTime
                ? formatDate(scheduledCalculationData.createdTime)
                : '-'
            }`}</Body>
            <Body level={3}>{`Schedule: Runs every ${
              convertMillisecondsToDuration(scheduledCalculationData?.period) ||
              '-'
            }`}</Body>
          </Flex>
        </Collapse.Panel>
      </StyledCollapse>
      <HorizontalDivider />
      <DescriptionButtonContainer>
        <Button
          size="small"
          type="ghost"
          icon="Document"
          onClick={() => setIsDescriptionModalOpen(true)}
        >
          Show Description
        </Button>
      </DescriptionButtonContainer>

      {isDescriptionModalOpen && (
        <StyledModal
          visible
          onCancel={() => setIsDescriptionModalOpen(false)}
          footer={
            <Button
              type="ghost"
              onClick={() => setIsDescriptionModalOpen(false)}
            >
              Cancel
            </Button>
          }
          title={
            <Flex gap={8} alignItems="center">
              <Icon type="Document" />
              <Title level={5}>Description</Title>
            </Flex>
          }
        >
          {scheduledCalculationData?.description}
        </StyledModal>
      )}
    </SummaryWrapper>
  );
};
