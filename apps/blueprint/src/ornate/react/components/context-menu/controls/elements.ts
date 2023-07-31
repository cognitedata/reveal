import styled from 'styled-components';

// Document control
export const DocumentNameSpan = styled.span`
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

// Fill control
export const FillControlButton = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 16px;
  background: var(--cogs-greyscale-grey5);
  box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.2) inset;
`;

// Stroke control
export const StrokeControlButton = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 16px;
  border: 2px solid var(--cogs-greyscale-grey5);
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

export const ThicknessSliderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .cogs-btn {
    border: none;
  }
`;

// Text control
export const TextControlWrapper = styled.div`
  width: 64px;
  height: 32px;
  display: inline-flex;
  .cogs-input {
    width: 100%;
    height: 100%;
    border: none;
  }
  .arrows {
    height: 32px !important;
    button {
      border: none;
    }
  }
`;
