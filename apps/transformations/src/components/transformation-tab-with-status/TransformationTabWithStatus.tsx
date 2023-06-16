import { useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import SqlEditor from '@transformations/pages/transformation-details/SqlEditor';

import {
  Body,
  Colors,
  Flex,
  Icon,
  IconType,
  SegmentedControl,
} from '@cognite/cogs.js';

export type TransformationTabStatusType =
  | 'success'
  | 'error'
  | 'warning'
  | 'loading'
  | 'unknown';

type TransformationTabWithStatusProps = {
  children: React.ReactNode;
  description: string | React.ReactNode;
  query: string;
  status: TransformationTabStatusType;
  title: string | React.ReactNode;
};

const getStatusStyles = (
  type: TransformationTabStatusType
): { color: string; iconType: IconType } => {
  switch (type) {
    case 'error':
      return {
        color: Colors['text-icon--status-critical'],
        iconType: 'ErrorFilled',
      };
    case 'success':
      return {
        color: Colors['text-icon--status-success'],
        iconType: 'CheckmarkFilled',
      };
    case 'loading':
    default:
      return {
        color: Colors['text-icon--status-neutral'],
        iconType: 'Loader',
      };
  }
};

const TransformationTabWithStatus = ({
  children,
  description,
  query,
  status,
  title,
}: TransformationTabWithStatusProps): JSX.Element => {
  const { t } = useTranslation();

  const [activeSegment, setActiveSegment] = useState('results');

  const styles = getStatusStyles(status);

  const handleSegmentedControlButtonClick = (key: string): void => {
    setActiveSegment(key);
  };

  return (
    <StyledContainer>
      <StyledHeader>
        <Flex alignItems="center" gap={12}>
          <span style={{ color: styles.color }}>
            <Icon size={24} type={styles.iconType} />
          </span>
          <StyledHeaderDivider />
          <Flex direction="column">
            <Body level={3} strong style={{ color: styles.color }}>
              {title}
            </Body>
            <Body level={3} style={{ color: Colors['text-icon--muted'] }}>
              {description}
            </Body>
          </Flex>
        </Flex>
        <div>
          <SegmentedControl
            size="small"
            onButtonClicked={handleSegmentedControlButtonClick}
          >
            <SegmentedControl.Button key="results">
              {t('results')}
            </SegmentedControl.Button>
            <SegmentedControl.Button key="sql">
              {t('sql')}
            </SegmentedControl.Button>
          </SegmentedControl>
        </div>
      </StyledHeader>
      <StyledContent>
        {activeSegment === 'results' ? children : <SqlEditor sql={query} />}
      </StyledContent>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  background-color: ${Colors['decorative--grayscale--white']};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledHeader = styled.div`
  border-bottom: 1px solid ${Colors['border--muted']};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
`;

const StyledHeaderDivider = styled.div`
  background-color: ${Colors['border--muted']};
  height: 16px;
  width: 2px;
`;

const StyledContent = styled.div`
  overflow: hidden;
  flex: 1;
`;

export default TransformationTabWithStatus;
