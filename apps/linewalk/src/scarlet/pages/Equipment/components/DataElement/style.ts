import styled, { css } from 'styled-components';
import { Color } from 'scarlet/config';
import { Button as CogsButton } from '@cognite/cogs.js';

export const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 10px 4px 12px;
  margin: 8px 0;
  border: 1px solid rgba(83, 88, 127, 0.16);
  border-radius: 6px;
`;

export const Content = styled.div<{ isLink?: boolean }>`
  overflow: hidden;
  padding: 5px 4px 5px 6px;

  ${({ isLink }) =>
    isLink &&
    css`
      cursor: pointer;
      background-color: var(--cogs-white)
      transition: background-color var(--cogs-transition-time-fast);
      border-radius: 4px;

      &:hover {
        background-color: var(--cogs-greyscale-grey2);
      }
    `};
`;

const oneLineText = css`
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const Label = styled.div`
  color: rgba(0, 0, 0, 0.7);
  ${oneLineText}
`;

export const Value = styled.div<{ secondary?: boolean }>`
  ${oneLineText}
  color: rgba(0, 0, 0, ${({ secondary }) => (secondary ? 0.55 : 0.9)});
`;

export const DataContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const getDataSourceBgColor = ({
  isDiscrepancy,
  isApproved,
  isOmitted,
}: {
  isDiscrepancy?: boolean;
  isApproved?: boolean;
  isOmitted?: boolean;
}) => {
  if (isApproved) return Color.APPROVED;
  if (isDiscrepancy) return Color.CRITICAL;
  if (isOmitted) return Color.IGNORED;
  return Color.PENDING;
};

export const DataSource = styled.div<{
  isDiscrepancy?: boolean;
  isApproved?: boolean;
  isOmitted?: boolean;
}>`
  display: flex;
  color: var(--cogs-white);
  border-radius: 4px;
  padding: 1px 4px;
  align-items: center;
  gap: 4px;
  background-color: ${getDataSourceBgColor};
`;

export const Actions = styled.div`
  flex-shrink: 0;
  margin-left: auto;
  display: flex;
  gap: 4px;
  padding-left: 8px;
`;

export const Button = styled(CogsButton)`
  width: 28px;
  color: rgba(0, 0, 0, 0.9);
`;
