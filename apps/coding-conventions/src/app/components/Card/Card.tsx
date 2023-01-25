import { Body, Button, Icon, Title as CogsTitle } from '@cognite/cogs.js';
import styled from 'styled-components';

interface Props {
  title: string;
  subtitle: string;
  onClick?: () => void;
}

export const Card: React.FC<Props> = ({ title, subtitle, onClick }) => {
  return (
    <Container onClick={onClick} role="button">
      <Header>
        <Icon size={18} type="Document" />
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </Header>
    </Container>
  );
};

const Container = styled.div`
  min-width: 270px;
  height: 130px;
  border-radius: 10px;
  box-shadow: 0px 1px 8px rgba(79, 82, 104, 0.1),
    0px 1px 1px rgba(79, 82, 104, 0.1);
  padding: 20px;
  cursor: pointer;

  transition: all 300ms;

  &:hover {
    box-shadow: 0px 6px 20px 2px rgba(79, 82, 104, 0.06),
      0px 2px 6px 1px rgba(79, 82, 104, 0.12);
  }
`;

// const Actions = styled.div`
//   display: flex;
//   width: 100%;
//   align-items: center;
//   margin: 0 auto;
//   justify-content: flex-end;
//   position: absolute;
//   bottom: 16px;
//   right: 16px;
// `;

const Header = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled(CogsTitle).attrs({ level: 5 })`
  margin-top: 8px !important;
`;

const Subtitle = styled(Body).attrs({ level: 3 })`
  margin-top: 8px;
`;
