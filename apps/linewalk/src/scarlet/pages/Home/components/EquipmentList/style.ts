import styled, { css } from 'styled-components';

import { EquipmentStatus } from './types';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
`;

export const ContentWrapper = styled.div<{ empty?: boolean }>`
  margin: 0 32px;
  padding-bottom: 32px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  position: relative;

  ${({ empty }) =>
    empty &&
    css`
      text-align: center;
      justify-content: center;
    `}
`;

export const Filters = styled.div`
  margin-bottom: 24px;
`;

export const LoaderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 50vh;
  min-height: 300px;

  > div {
    position: absolute;
  }
`;

export const TableContainer = styled.div<{ isLoading: boolean }>`
  flex-grow: 1;

  td,
  th {
    padding: 10px 16px 10px 0;
    display: flex;
    align-items: center;

    &:first-child {
      padding-left: 16px;
      flex: 50 0 auto !important;
      min-width: 0 !important;
      width: 48px !important;
    }
  }

  th {
    padding: 13px 16px 13px 0;

    span {
      line-height: 0;
    }
  }
`;

export const StatusLabel = styled.div<{ status: EquipmentStatus }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;

  ${({ status }) => {
    switch (status) {
      case EquipmentStatus.ONGOING:
        return css`
          color: #b25c00;
          background-color: rgba(255, 187, 0, 0.14);
        `;
      case EquipmentStatus.COMPLETED:
        return css`
          color: var(--cogs-green-1);
          background: rgba(24, 175, 142, 0.1);
        `;

      default:
        return css`
          color: var(--cogs-secondary-text);
          background-color: rgba(0, 0, 0, 0.05);
        `;
    }
  }}
`;

export const Value = styled.div`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;
