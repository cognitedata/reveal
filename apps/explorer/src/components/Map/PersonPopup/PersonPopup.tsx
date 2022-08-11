import { Body } from '@cognite/cogs.js';
import { Person } from 'graphql/generated';

import { TextWrapper } from '../Popup/elements';
import { PopupContent } from '../Popup/PopupContent';

export interface Props {
  data: Person;
}

export const PersonPopup: React.FC<Props> = ({ data }) => {
  const desk = data.desk || { name: '' };

  return (
    <PopupContent
      name={data.name || 'No name'}
      isEditable={false}
      nodeId={data.desk?.nodeId}
    >
      <TextWrapper>
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
