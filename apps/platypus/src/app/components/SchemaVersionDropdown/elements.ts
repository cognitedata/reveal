import { Button, Menu, Body } from '@cognite/cogs.js';
import { DataModelVersionStatus } from '@platypus/platypus-core';
import styled from 'styled-components/macro';

export const DropdownButton = styled(Button)<{ open: boolean }>`
  display: flex;
  justify-content: space-between;
  min-width: 76px;
  max-width: 200px;
  width: 100%;
  border-radius: 6px;
  background: #fff;
  height: 36px;
  padding-left: 10px;
  padding-right: 10px;
  white-space: nowrap;
  border: ${(props) =>
    props.open ? '1px solid #4a67fb' : '1px solid #d9d9d9'} !important;
`;

export const MenuItem = styled(Menu.Item)<{ selected: boolean }>`
  && {
    background: ${(props) => props.selected && 'rgba(74, 103, 251, 0.08)'};
    display: flex;
    justify-content: space-between;
    height: 40px;
    overflow: visible;
  }
`;

export const VersionTag = styled.span<{ status: DataModelVersionStatus }>`
  color: ${(props) =>
    props.status === DataModelVersionStatus.DRAFT
      ? 'var(--cogs-greyscale-grey7)'
      : 'var(--cogs-midblue-1)'};
  background: ${(props) =>
    props.status === DataModelVersionStatus.DRAFT
      ? 'rgba(102, 102, 102, 0.12)'
      : 'rgba(110, 133, 252, 0.12)'};
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  white-space: nowrap;
  border-radius: 4px;
  height: 20px;
  padding: 2px 6px;
`;

export const LastTimeText = styled(Body)`
  font-size: 12px;
  line-height: 16px;
  text-align: left;
  color: rgba(0, 0, 0, 0.55);
  margin-right: 12px;
`;
