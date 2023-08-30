import React from 'react';

import styled from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';

import {
  Body,
  Colors,
  Detail,
  Elevations,
  Icon,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';

type SidePanelDatabaseListItemTooltipProps = {
  children: React.ReactElement<any>;
  name: string;
  tables: RawDB[];
};

const StyledDatabaseListItemTooltipWrapper = styled(Tooltip)`
  && {
    background-color: ${Colors['surface--muted']};
    border-radius: 12px;

    .tippy-svg-arrow {
      fill: ${Colors['surface--muted']};
      stroke: ${Colors['surface--muted']};
    }
  }

  box-shadow: ${Elevations['elevation--surface--non-interactive']};

  max-width: unset !important; /* overrides cogs style */
  min-width: 200px;

  .tippy-content {
    background-color: ${Colors['surface--muted']};
    border-radius: 12px;
    padding: 0;
  }
`;

const StyledTooltipContent = styled.div`
  color: black;
`;

const StyledTooltipHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${Colors['border--interactive--default']};
  display: flex;
  padding: 16px;
`;

const StyledTooltipHeaderIcon = styled(Icon)`
  background-color: ${Colors['surface--interactive--toggled-default']};
  border-radius: 6px;
  color: ${Colors['text-icon--interactive--default']};
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
  color: ${Colors['text-icon--status-success']};
  margin-right: 8px;
`;

const SidePanelDatabaseListItemTooltip = ({
  children,
  name,
  tables,
}: SidePanelDatabaseListItemTooltipProps): JSX.Element => {
  const { t } = useTranslation();
  const renderTables = (): JSX.Element => {
    if (tables.length === 0) {
      return (
        <Detail>{t('explorer-side-panel-databases-tooltip-no-tables')}</Detail>
      );
    }

    return (
      <>
        <Body level={2} strong>
          {t('explorer-side-panel-databases-tooltip-tables')}
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
