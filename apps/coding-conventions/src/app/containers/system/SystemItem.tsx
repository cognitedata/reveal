import {
  Body,
  Button,
  Detail,
  Icon,
  IconType,
  Title as CogsTitle,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { Card } from '../../components/Card';

interface Props {
  icon?: IconType;
  title: string;
  description?: string;
  structure: string;
  onClick?: () => void;
}

export const SystemItem: React.FC<Props> = ({
  icon,
  title,
  description,
  structure,
  onClick,
}) => {
  return (
    <Card onClick={onClick}>
      <Header>
        <Icon size={18} type={icon || 'Document'} />
        <Title>{title}</Title>
        <Subtitle>{description}</Subtitle>
      </Header>

      <Divider />
      <Detail>
        Structure: {structure ? <>{structure}</> : <i>unspecified</i>}
      </Detail>
    </Card>
  );
};

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
