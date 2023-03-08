import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

interface Props {
  text: string;
}

export const HintText: React.FC<Props> = ({ text }) => {
  return (
    <Container>
      <Icon type="Info" />
      {text}
    </Container>
  );
};

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  user-select: none;
`;
