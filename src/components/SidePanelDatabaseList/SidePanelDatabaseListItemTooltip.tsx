import React from 'react';

import { Body, Colors, Detail, Icon, Title, Tooltip } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';
import styled from 'styled-components';

type SidePanelDatabaseListItemTooltipProps = {
  children: React.ReactElement<any>;
  name: string;
  tables: RawDB[];
};

const StyledDatabaseListItemTooltipWrapper = styled(Tooltip)`
  && {
    background-color: ${Colors.white};
    border-radius: 12px;

    .tippy-svg-arrow {
      fill: ${Colors.white};
      stroke: ${Colors.white};
    }
  }

  max-width: unset !important; /* overrides cogs style */
  min-width: 200px;

  .tippy-content {
    background-color: ${Colors.white};
    border-radius: 12px;
    padding: 0;
  }
`;

const StyledTooltipContent = styled.div`
  color: black;
`;

const StyledTooltipHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${Colors['border-default']};
  display: flex;
  padding: 16px;
`;

const StyledTooltipHeaderIcon = styled(Icon)`
  background-color: ${Colors['bg-hover']};
  border-radius: 6px;
  color: ${Colors['bg-status-small--accent-pressed']};
  margin-right: 8px;
  padding: 10px;
  width: 36px !important; /* overrides cogs style */
`;

const StyledTooltipBody = styled.div`
  padding: 20px 16px;
`;

const StyledTooltipTableListItemWrapper = styled.div`
  align-items: center;
  display: flex;
  margin-top: 4px;
`;

const StyledTooltipTableListItemIcon = styled(Icon)`
  color: ${Colors['green-2']};
  margin-right: 8px;
`;

const SidePanelDatabaseListItemTooltip = ({
  children,
  name,
  tables,
}: SidePanelDatabaseListItemTooltipProps): JSX.Element => {
  const renderTables = (): JSX.Element => {
    if (tables.length === 0) {
      return <Detail>This database has no tables</Detail>;
    }

    return (
      <>
        <Body level={2} strong>
          Tables
        </Body>
        {tables.slice(0, 5).map(({ name: tableName }) => (
          <StyledTooltipTableListItemWrapper key={tableName}>
            <StyledTooltipTableListItemIcon type="DataTable" />
            <Body level={2}>{tableName}</Body>
          </StyledTooltipTableListItemWrapper>
        ))}
        {tables.length > 5 && (
          <StyledTooltipTableListItemWrapper>
            <Body level={2}>+{tables.length - 5} more</Body>
          </StyledTooltipTableListItemWrapper>
        )}
      </>
    );
  };

  return (
    <StyledDatabaseListItemTooltipWrapper
      className="z-8"
      content={
        <StyledTooltipContent>
          <StyledTooltipHeader>
            <StyledTooltipHeaderIcon type="DataSource" />
            <Title level={5}>{name}</Title>
          </StyledTooltipHeader>
          <StyledTooltipBody>{renderTables()}</StyledTooltipBody>
        </StyledTooltipContent>
      }
      placement="right-start"
    >
      {children}
    </StyledDatabaseListItemTooltipWrapper>
  );
};

export default SidePanelDatabaseListItemTooltip;
