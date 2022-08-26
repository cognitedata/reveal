/**
 * Commented code it related to NDS/NPT detail page functionality. It has been remporarily
 * Removed from Stick chart tab so code is kept in case it is needed in future.
 */
import * as React from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { Dropdown } from 'components/Dropdown';
import { FlexColumn } from 'styles/layout';

import {
  NDS_EVENT_DETAILS_LABEL,
  NPT_EVENT_DETAILS_LABEL,
} from '../../../common/Events/constants';
import { EventsColumnView } from '../../../common/Events/types';
import { ViewModeControl } from '../../../common/ViewModeControl';

import {
  HeaderWrapper,
  SegmentedControlStyler,
  Subtitle,
  Title,
} from './elements';

interface HeaderProps {
  wellName: string;
  wellboreName: string;
  wellboreMatchingId: string;
  onChangeDropdown: ({
    wellName,
    wellboreName,
  }: {
    eventType: 'npt' | 'nds';
    wellName: string;
    wellboreName: string;
    wellboreMatchingId: string;
  }) => void;
  onEventViewModeChange: (viewMode: EventsColumnView) => void;
}

export const Header: React.FC<HeaderProps> = ({
  wellName,
  wellboreName,
  wellboreMatchingId,
  onChangeDropdown,
  onEventViewModeChange,
}) => {
  const [eventViewMode, setEventViewMode] = useState(EventsColumnView.Cluster);

  useEffect(() => {
    onEventViewModeChange(eventViewMode);
  }, [eventViewMode]);

  const handleChangeNptDropdown = () => {
    onChangeDropdown({
      eventType: 'npt',
      wellName,
      wellboreName,
      wellboreMatchingId,
    });
  };

  const handleChangeNdsDropdown = () => {
    onChangeDropdown({
      eventType: 'nds',
      wellName,
      wellboreName,
      wellboreMatchingId,
    });
  };

  return (
    <HeaderWrapper>
      <FlexColumn>
        <Title>{wellName}</Title>
        <Subtitle>{wellboreName}</Subtitle>
      </FlexColumn>

      <SegmentedControlStyler>
        <ViewModeControl
          views={Object.values(EventsColumnView)}
          selectedView={eventViewMode}
          onChangeView={setEventViewMode}
        />
      </SegmentedControlStyler>
      <Dropdown
        content={
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleChangeNdsDropdown}>
              {NDS_EVENT_DETAILS_LABEL}
            </Dropdown.Item>
            <Dropdown.Item onClick={handleChangeNptDropdown}>
              {NPT_EVENT_DETAILS_LABEL}
            </Dropdown.Item>
          </Dropdown.Menu>
        }
      >
        <Button icon="ChevronDown" iconPlacement="right">
          Details
        </Button>
      </Dropdown>
    </HeaderWrapper>
  );
};
