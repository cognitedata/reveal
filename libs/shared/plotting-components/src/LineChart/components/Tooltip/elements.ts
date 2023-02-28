import styled from 'styled-components/macro';

export const TooltipWrapper = styled.div`
  position: absolute;
  transform: translateY(-50%);
  transition: opacity 0.4s ease;
`;

export const TooltipContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-sizing: border-box;
  padding: 8px;
  gap: 8px;
  box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.04),
    0px 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
`;

export const TooltipDetailWrapper = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 12px;
  line-height: 16px;
  padding: 8px 12px;
  border-radius: 8px;
`;

export const TooltipDetailLabel = styled.div`
  font-weight: 500;
  margin-right: 4px;
`;

export const TooltipDetailValue = styled.div`
  font-weight: 400;
`;
