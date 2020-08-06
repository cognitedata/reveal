import React, { ReactNode, FunctionComponent } from 'react';
import { Tooltip } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';

type InfoGridProps = {
  noBorders?: boolean;
};
export const InfoGrid = styled.div<InfoGridProps>(
  props => css`
    position: relative;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    color: var(--cogs-greyscale-grey10);
    ${!props.noBorders &&
    css`
      border-top: 1px solid var(--cogs-greyscale-grey4);
      border-left: 1px solid var(--cogs-greyscale-grey4);
    `}

    .button-row {
      display: flex;
      align-items: stretch;
    }

    .button-row > * {
      margin-left: 8px;
    }
    .button-row > *:nth-child(1) {
      margin-left: 0px;
    }
  `
);

type InfoCellContainerProps = {
  noBorders?: boolean;
  noPadding?: boolean;
  half?: boolean;
};
const InfoCellContainer = styled.div<InfoCellContainerProps>`
  padding: 16px;
  padding-top: ${props => (props.noPadding ? 0 : '16px')};
  padding-bottom: ${props => (props.noPadding ? 0 : '16px')};
  display: inline-block;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  width: ${props => (props.half ? '50%' : '100%')};
  ${props =>
    !props.noBorders &&
    css`
      border-bottom: 1px solid var(--cogs-greyscale-grey4);
      border-right: 1px solid var(--cogs-greyscale-grey4);
    `}

  &:last-child {
    flex: 1;
    overflow: auto;
  }

  .title {
    text-transform: uppercase;
    color: var(--cogs-greyscale-grey7);
    font-size: 12px;
    padding-bottom: 8px;
  }

  .latest-reading {
    font-size: 32px;
    margin-bottom: 0;
    display: flex;
    align-items: center;

    p {
      margin-bottom: 5px;
    }

    .unit {
      font-size: 24px;
    }
  }
`;

type InfoCellProps = {
  id?: string;
  title?: string;
  children: ReactNode;
  half?: boolean;
  noBorders?: boolean;
  noPadding?: boolean;
  containerStyles?: React.CSSProperties;
};

export const InfoCell: FunctionComponent<InfoCellProps> = ({
  title,
  children,
  half = false,
  noBorders = false,
  noPadding = false,
  containerStyles,
  id,
}: InfoCellProps) => (
  <InfoCellContainer
    noBorders={noBorders}
    noPadding={noPadding}
    half={half}
    style={containerStyles}
    id={id}
  >
    {title && <div className="title">{title}</div>}
    {children}
  </InfoCellContainer>
);

const NoDataText = styled.span`
  font-style: italic;
`;

export const DetailsItem = (props: { name: string; value: any }) => (
  <>
    <InfoCell
      half
      containerStyles={{
        borderRight: 'none',
        borderLeft: 'none',
        overflow: 'hidden',
      }}
    >
      <Tooltip placement="bottom" content={props.name}>
        <span>{props.name}:</span>
      </Tooltip>
    </InfoCell>
    <InfoCell
      half
      containerStyles={{ borderRight: 'none', overflow: 'hidden' }}
    >
      <Tooltip placement="bottom" content={props.value || 'Not set'}>
        {props.value || <NoDataText>Not set</NoDataText>}
      </Tooltip>
    </InfoCell>
  </>
);
