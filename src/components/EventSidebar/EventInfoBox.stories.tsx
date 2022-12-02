/**
 * Event InfoBox Story
 */
import { Meta, Story } from '@storybook/react';
import EventInfoBox from './EventInfoBox';

type Props = React.ComponentProps<typeof EventInfoBox>;

export default {
  component: EventInfoBox,
  title: 'Components/Events/InfoBox',
} as Meta;

const Template: Story<Props> = (args) => {
  return (
    <div style={{ width: '400px' }}>
      <EventInfoBox {...args} />
    </div>
  );
};

export const InfoBox = Template.bind({});
export const InfoBoxLoading = Template.bind({});
export const InfoBoxNilEventRange = Template.bind({});
export const InfoBoxSelected = Template.bind({});
export const Translated = Template.bind({});

const eventData = {
  type: 'Work order',
  subtype: 'maintenance',
  lastUpdatedTime: new Date('Tue Nov 01 2022 09:16:49'),
  createdTime: new Date('Tue Nov 30 2022 17:16:49'),
  startTime: new Date('Tue Nov 01 2022 09:16:49'),
  endTime: new Date('Tue Nov 30 2022 17:16:49'),
  externalId: 'AA-PT21SRKO',
};

InfoBox.args = {
  onToggleEvent: () => {},
  event: {
    ...eventData,
  },
};

InfoBoxLoading.args = {
  onToggleEvent: () => {},
  loading: true,
  event: {
    ...eventData,
  },
};

InfoBoxNilEventRange.args = {
  onToggleEvent: () => {},
  event: {
    ...eventData,
    startTime: new Date('Tue Nov 30 2022 09:16:49'),
    endTime: new Date('Tue Nov 30 2022 09:16:49'),
  },
};

InfoBoxSelected.args = {
  onToggleEvent: () => {},
  selected: true,
  event: {
    ...eventData,
    type: 'Annotation (Selected)',
  },
};

Translated.args = {
  onToggleEvent: () => {},
  event: {
    ...eventData,
    type: 'Annotation Translated',
  },
  translations: {
    Created: '作成した',
    End: '終わり',
    'Event start and end time are the same, it may not be visible in the chart graph area.':
      'イベントの開始時間と終了時間が同じで、チャート グラフ エリアに表示されない場合があります。',
    'External ID': '外部 ID',
    'Root asset': 'ルートアセット',
    Start: '始める',
    'Sub type': 'サブタイプ',
    Type: 'タイプ',
    Updated: '更新しました',
  },
};
