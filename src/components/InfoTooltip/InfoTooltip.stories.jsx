/* eslint-disable react/no-multi-comp */
import React from 'react';
import { storiesOf } from '@storybook/react';

import Provider from 'subApp/../../.storybook/boilerplate';
import InfoTooltip from './InfoTooltip';

storiesOf('subApp/vision|InfoTooltip', module)
  .addDecorator(story => <Provider story={story} />)
  .add('Base', () => (
    <InfoTooltip tooltipText="text" url="www.imALink.com" urlTitle="linkName">
      Hover me{' '}
    </InfoTooltip>
  ));
