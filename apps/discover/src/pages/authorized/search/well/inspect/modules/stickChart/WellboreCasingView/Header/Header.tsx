/**
 * Commented code it related to NDS/NPT detail page functionality. It has been remporarily
 * Removed from Stick chart tab so code is kept in case it is needed in future.
 */
import React from 'react';

import { Button } from '@cognite/cogs.js';

import { Dropdown } from 'components/Dropdown';
import { SegmentedControl } from 'components/SegmentedControl/SegmentedControl';
import { FlexColumn } from 'styles/layout';

import {
  NDS_EVENT_DETAILS_LABEL,
  NPT_EVENT_DETAILS_LABEL,
} from '../../../common/Events/constants';
import { EventsColumnView } from '../../../common/Events/types';

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
  currentEventViewMode: EventsColumnView;
  onEventViewModeChange: (viewMode: EventsColumnView) => void;
}

export const Header: React.FC<HeaderProps> = ({
  wellName,
  wellboreName,
  wellboreMatchingId,
  onChangeDropdown,
  currentEventViewMode,
  onEventViewModeChange,
}) => {
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
        <SegmentedControl
          onTabChange={(tabKey) => onEventViewModeChange(tabKey as any)}
          currentTab={currentEventViewMode}
          tabs={{
            [EventsColumnView.Cluster]: 'Cluster view',
            [EventsColumnView.Scatter]: 'Scatter view',
          }}
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
