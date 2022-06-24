import { withKnobs } from '@storybook/addon-knobs';

import { Props as PopupProps, Popup as PopupComponent } from './Popup';

export default {
  title: 'Popup',
  decorators: [withKnobs],
};

const PopupStory = ({
  mainText,
  subText,
  labels,
  iconType,
  disableRoute,
}: PopupProps) => (
  <PopupComponent
    mainText={mainText}
    subText={subText}
    labels={labels}
    iconType={iconType}
    disableRoute={disableRoute}
  />
);

export const Popup = PopupStory.bind({});
Popup.args = {
  mainText: 'Test',
  subText: 'Test2',
  labels: ['oslo', 'floor 6'],
  iconType: 'Boards',
  disableRoute: false,
};
