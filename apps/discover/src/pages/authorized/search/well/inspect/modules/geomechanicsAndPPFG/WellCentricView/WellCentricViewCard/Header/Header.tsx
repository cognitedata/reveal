import * as React from 'react';

import { Checkbox } from '@cognite/cogs.js';

import { FlexGrow } from 'styles/layout';

import { EventsColumnView } from '../../../../common/Events/types';

import { HeaderTextWrapper, HeaderWrapper, Subtitle, Title } from './elements';
import { EventsColumnViewControl } from './EventsColumnViewControl';

interface HeaderProps {
  wellName: string;
  wellboreName: string;
  isSelected: boolean;
  onChangeCheckbox: (isSelected: boolean) => void;
  onChangeEventsColumnView: (view: EventsColumnView) => void;
}

export const Header: React.FC<HeaderProps> = ({
  wellName,
  wellboreName,
  isSelected = false,
  onChangeCheckbox,
  onChangeEventsColumnView,
}) => {
  return (
    <HeaderWrapper>
      <Checkbox
        name={`well-centric-card-${wellboreName}`}
        checked={isSelected}
        onChange={onChangeCheckbox}
      >
        <HeaderTextWrapper data-testid="wellbore-details">
          <Title>{wellName}</Title>
          <Subtitle>{wellboreName}</Subtitle>
        </HeaderTextWrapper>
      </Checkbox>

      <FlexGrow />

      <EventsColumnViewControl onChange={onChangeEventsColumnView} />
    </HeaderWrapper>
  );
};
