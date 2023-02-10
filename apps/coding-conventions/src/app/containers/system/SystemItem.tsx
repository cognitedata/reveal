import {
  Body,
  Button,
  Detail,
  Flex,
  Icon,
  IconType,
  Title as CogsTitle,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { Card } from '../../components/Card';
import { Resource } from '../../types';

interface Props {
  resource: Resource;
  title: string;
  description?: string;
  structure: string;
  onClick?: () => void;
}

export const SystemItem: React.FC<Props> = ({
  resource,
  title,
  description,
  structure,
  onClick,
}) => {
  return (
    <Card onClick={onClick}>
      <Header>
        <Icon size={18} type={resource === 'files' ? 'Document' : 'Assets'} />
        <Title>{title}</Title>
        <Subtitle>{description || 'No description found...'}</Subtitle>
      </Header>

      {/* <Divider /> */}
      <FooterText>
        Structure: {structure ? <>{structure}</> : <i>unspecified</i>}
      </FooterText>
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

const FooterText = styled(Detail)`
  margin-bottom: auto;
  font-style: italic;

  position: absolute;
  bottom: 16px;
`;
