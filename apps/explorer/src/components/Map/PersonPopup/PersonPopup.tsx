import { Body, Icon, Title } from '@cognite/cogs.js';
import { Person } from 'graphql/generated';

import { TextWrapper } from '../Popup/elements';
import { PopupContent } from '../Popup/PopupContent';

export interface Props {
  data: Person;
}

const renderIcon = () => <Icon size={54} type="Grid" />;

export const PersonPopup: React.FC<Props> = ({ data }) => {
  const desk = data.desk || { name: '' };

  return (
    <PopupContent
      Icon={renderIcon}
      isEditable={false}
      nodeId={data.desk?.nodeId}
    >
      <TextWrapper>
        <Title level={3}>{data.name}</Title>
        <Body>Slack: {data.slackId || 'N/A'}</Body>
        <Body>
          {desk.name
            ? `This person sits at ${desk.name}`
            : 'This person does not have a desk'}
        </Body>
      </TextWrapper>
    </PopupContent>
  );
};
