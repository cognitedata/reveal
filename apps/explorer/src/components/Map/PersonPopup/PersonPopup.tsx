import { Body, Icon, Title } from '@cognite/cogs.js';
import { Person } from 'graphql/generated';

import { Container, Content, TextWrapper } from '../Popup/elements';
import { PopupContent } from '../Popup/PopupContent';

export interface Props {
  data: Person;
}

export const PersonPopup: React.FC<Props> = ({ data }) => {
  const desk = data.desk || { name: '' };

  return (
    <Container>
      <Content className="z-2">
        <PopupContent Icon={<Icon size={54} type="Grid" />} labels={[]}>
          <TextWrapper>
            <Title level={3}>{data.name}</Title>
            <Body>Slack: {data.slackId || 'N/A'}</Body>
            <Body>
              {desk.name
                ? `This person sits at  ${desk.name}`
                : 'This person does not have a desk'}
            </Body>
          </TextWrapper>
        </PopupContent>
      </Content>
    </Container>
  );
};
