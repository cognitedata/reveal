import {
  Body,
  Button,
  Detail,
  Icon,
  IconType,
  Title as CogsTitle,
} from '@cognite/cogs.js';
import styled from 'styled-components';

interface Props {
  icon?: IconType;
  title: string;
  subtitle?: string;
  structure?: string;
  onClick?: () => void;
}

export const Card: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  structure,
  onClick,
}) => {
  return (
    <Container onClick={onClick} role="button">
      <Header>
        <Icon size={18} type={icon || 'Document'} />
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </Header>

      <Divider />
      <Detail>
        Structure: {structure ? <>{structure}</> : <i>unspecified</i>}
      </Detail>
    </Container>
  );
};

const Container = styled.div`
  min-width: 270px;
  height: 160px;
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

const Subtitle = styled(Body).attrs((args) => ({ level: args.level || 3 }))`
  margin-top: 8px;
`;

const Divider = styled.div`
  height: 1px;
  margin-top: 16px;
  margin-bottom: 8px;
  width: 100%;
  background-color: #d9d9d9;
`;
