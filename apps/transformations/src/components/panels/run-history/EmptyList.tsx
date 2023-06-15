import styled from 'styled-components';

import { Colors, Detail, Title } from '@cognite/cogs.js';

interface EmptyListProps {
  title: string;
  details: string;
}

const EmptyList = ({ title, details }: EmptyListProps) => (
  <StyledContainer>
    <StyledTitle>{title}</StyledTitle>
    <StyledDetail>{details}</StyledDetail>
  </StyledContainer>
);

const StyledContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--strong']};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  padding: 36px 48px;
`;

const StyledTitle = styled(Title).attrs({ level: 6 })`
  color: ${Colors['text-icon--strong']};
`;

const StyledDetail = styled(Detail).attrs({ strong: true })`
  color: ${Colors['text-icon--muted']};
  margin: 8px 0 0;
  text-align: center;
`;

export default EmptyList;
