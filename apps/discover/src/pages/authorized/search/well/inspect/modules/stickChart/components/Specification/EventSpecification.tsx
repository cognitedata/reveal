import * as React from 'react';

import { FlexColumn } from 'styles/layout';

import {
  Depth,
  EventSpecificationWrapper,
  HighlightedEventText,
} from '../../WellboreStickChart/SummaryColumn/elements';
import { Avatar } from '../DetailCard/elements';

export interface SpecificationLabelProps {
  color: string;
  label: string;
  depth?: string;
}

export const EventSpecification: React.FC<SpecificationLabelProps> = ({
  color,
  label,
  depth,
}) => {
  return (
    <EventSpecificationWrapper>
      <Avatar color={color} />
      <FlexColumn>
        <HighlightedEventText>{label}</HighlightedEventText>
        {depth && <Depth>{depth}</Depth>}
      </FlexColumn>
    </EventSpecificationWrapper>
  );
};
