/**
 * Elements for Appearance/Style Dropdown
 */

import styled from 'styled-components/macro';

export const DropdownWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 250px;
  overflow: hidden;
`;

export const MenuWrapper = styled.div`
  max-height: 250px;
  overflow-y: auto;
  padding: 0 10px;
  border-left: 1px solid var(--cogs-border-default);

  &:first-child {
    padding: 0;
    border-left: none;
  }
`;

export const PreviewContainer = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 10px;
`;

export const ColorPreview = styled(PreviewContainer)`
  background-color: ${(props) => props.color};
  border-radius: 2px;
`;

export const WeightLine = styled.div`
  width: 10px;
  height: 10px;
  border-bottom: ${(props: { weight: number }) => props.weight}px solid black;
  position: absolute;
`;

export const TypeLine = styled.div`
  width: 20px;
  height: 10px;
  border-bottom: 3px ${(props: { type: string }) => props.type} black;
  position: absolute;
`;
