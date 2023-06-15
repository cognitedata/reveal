import React, { useState } from 'react';

import styled from 'styled-components';

import { PREVIEW_TAB_HEIGHT, useTranslation } from '@transformations/common';
import SqlEditor from '@transformations/pages/transformation-details/SqlEditor';
import { ColorStatus } from '@transformations/utils';

import {
  Button,
  Colors,
  Elevations,
  Flex,
  SegmentedControl,
} from '@cognite/cogs.js';

import TabHeader, { TabHeaderProps } from './TabHeader';

type TabProps = {
  children: React.ReactNode;
  className?: string;
  headerProps: Omit<TabHeaderProps, 'status'>;
  onClose?: () => void;
  sql?: string;
  status: ColorStatus;
};

const Tab = ({
  children,
  className,
  headerProps,
  onClose,
  sql,
  status = 'undefined',
}: TabProps): JSX.Element => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [tabView, setTabView] = useState<string>();

  return (
    <StyledTabContainer $isExpanded={isExpanded} className={className}>
      <StyledTabHeader
        {...headerProps}
        extra={
          <Flex gap={8}>
            {sql ? (
              <SegmentedControl
                currentKey={tabView}
                size="small"
                onButtonClicked={(key) => setTabView(key)}
              >
                <SegmentedControl.Button key="results">
                  {t('results')}
                </SegmentedControl.Button>
                <SegmentedControl.Button key="sql">
                  {t('sql')}
                </SegmentedControl.Button>
              </SegmentedControl>
            ) : undefined}
            <Flex gap={4}>
              <Button
                icon={isExpanded ? 'Collapse' : 'Expand'}
                onClick={() => setIsExpanded((prevState) => !prevState)}
                size="small"
                type="ghost"
              />
              {onClose && (
                <Button
                  icon="Close"
                  onClick={onClose}
                  size="small"
                  type="ghost"
                />
              )}
            </Flex>
          </Flex>
        }
        status={status}
      />
      <StyledTabContent>
        {sql && tabView === 'sql' ? <SqlEditor sql={sql} /> : children}
      </StyledTabContent>
    </StyledTabContainer>
  );
};

const StyledTabContainer = styled.div<{ $isExpanded?: boolean }>`
  background-color: ${Colors['surface--muted']};
  border: 1px solid ${Colors['border--interactive--disabled']};
  border-radius: 6px;
  display: flex;
  height: ${({ $isExpanded }) =>
    $isExpanded ? '100%' : `${PREVIEW_TAB_HEIGHT}px`};
  min-height: ${PREVIEW_TAB_HEIGHT}px; /* TODO: make it responsive */
  flex-direction: column;
  width: 100%;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  :hover {
    box-shadow: ${Elevations['elevation--surface--interactive']};
  }
`;

const StyledTabHeader = styled(TabHeader)`
  padding: 10px 12px;
`;

const StyledTabContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
`;

export default Tab;
