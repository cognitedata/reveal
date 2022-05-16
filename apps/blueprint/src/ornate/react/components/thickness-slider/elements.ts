import styled from 'styled-components';

export const ThicknessSliderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .cogs-btn {
    border: none;
  }
`;

export const ThicknessOption = styled.div<{
  $thickness: number;
  $isSelected: boolean;
  $color: string;
}>`
  width: ${(props) => props.$thickness + 2}px;
  height: ${(props) => props.$thickness + 2}px;
  background: ${(props) => props.$color};
  border-radius: 100px;
  border: 2px solid white;
  box-shadow: ${(props) =>
    props.$isSelected ? '0 0 0 2px var(--cogs-bg-control--primary)' : 'none'};
  cursor: pointer;
`;
