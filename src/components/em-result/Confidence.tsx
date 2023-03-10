import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

type ConfidenceProps = {
  score?: number;
};

export default function Confidence(props: ConfidenceProps) {
  const { score } = props;
  const percentage = score ? `${Math.round(score * 100)}%` : '0%';
  return <StyledConfidence>{percentage}</StyledConfidence>;
}

const StyledConfidence = styled.div`
  background-color: ${Colors['surface--misc-canvas']};
  border-radius: 4px;
  padding: 8px 29px;
  width: 100px;
  font-weight: 500;
`;
