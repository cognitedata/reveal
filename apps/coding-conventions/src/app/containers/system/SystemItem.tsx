import styled from 'styled-components';

import { Body, Detail, Icon, Title as CogsTitle } from '@cognite/cogs.js';

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

const FooterText = styled(Detail)`
  margin-bottom: auto;
  font-style: italic;

  position: absolute;
  bottom: 16px;
`;
