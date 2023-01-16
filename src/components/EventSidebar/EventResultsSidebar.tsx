/**
 * Event Results Sidebar
 */

import { useState, useCallback, memo, ComponentProps } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Body, Button } from '@cognite/cogs.js';
import { CogniteEvent } from '@cognite/sdk';
import {
  ContentContainer,
  OverlayContentOverflowWrapper,
  SidebarChip,
  SidebarHeaderActions,
  SmallSelect,
} from 'components/Common/SidebarElements';
import { activeEventFilterResultsSelector } from 'models/event-results/selectors';
import { EventsCollection, EventsEntry } from 'models/event-results/types';
import {
  activeEventIdAtom,
  selectedEventsAtom,
} from 'models/event-results/atom';
import { Col, Row } from 'antd';
import EventInfoBox from './EventInfoBox';
import { isEventSelected } from './helpers';

type Props = {
  onCloseEventResults: (id: string) => void;
  onShowEventDetail: () => void;
  translations?: ComponentProps<typeof EventInfoBox>['translations'];
};

const sortOptions = [
  { value: 'new' as const, label: 'Newest' },
  { value: 'old' as const, label: 'Oldest' },
];

const EventResultsSidebar = memo(
  ({ onCloseEventResults, onShowEventDetail, translations }: Props) => {
    // Get results
    const activeEventFilterResults = useRecoilValue(
      activeEventFilterResultsSelector
    );

    const [selectedEvents, setSelectedEvents] =
      useRecoilState(selectedEventsAtom);

    const [activeEvent, setActiveEvent] = useRecoilState(activeEventIdAtom);

    const selectedEventResults = activeEventFilterResults?.results?.filter(
      (event) => isEventSelected(selectedEvents, event)
    );

    const remainingEventResults = activeEventFilterResults?.results?.filter(
      (event) => !isEventSelected(selectedEvents, event)
    );

    const [sortOption, setSortOption] = useState<typeof sortOptions[number]>(
      sortOptions[1]
    );
    const handleSortList = (option: typeof sortOption) => {
      setSortOption(option);
    };

    const handleSetSelectedEventItems = useCallback(
      (id: number | undefined) => {
        if (!id) return;
        setSelectedEvents((prevVals: EventsCollection) => {
          const isSelected = prevVals.find((evt: EventsEntry) => evt.id === id);
          if (isSelected) {
            return prevVals.filter((val: EventsEntry) => val.id !== id);
          }

          return [{ id }, ...prevVals];
        });
      },
      [selectedEvents, setSelectedEvents]
    );

    const handleViewEvent = useCallback(
      (id: number | undefined) => {
        if (!id) return;
        setActiveEvent(id);
        onShowEventDetail();
      },
      [activeEvent, setActiveEvent, onShowEventDetail]
    );

    const handleClearAllSelection = useCallback(() => {
      setSelectedEvents([]);
    }, [selectedEvents, setSelectedEvents]);

    return (
      <OverlayContentOverflowWrapper>
        <ContentContainer>
          <SidebarHeaderActions>
            <Button
              onClick={() => onCloseEventResults('')}
              icon="ArrowLeft"
              size="small"
              aria-label="Back"
            >
              {translations?.Back || 'Back'}
            </Button>
            <SmallSelect
              title="Sort:"
              value={sortOption}
              onChange={handleSortList}
              options={sortOptions}
              width={140}
              disableTyping
            />
          </SidebarHeaderActions>
          {activeEventFilterResults && selectedEventResults?.length ? (
            <>
              <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: '8px' }}
              >
                <Col span={16}>
                  <Body level={2}>
                    Selected results:{' '}
                    <SidebarChip icon="Events" size="medium" $small>
                      {selectedEventResults?.length}
                    </SidebarChip>
                  </Body>
                </Col>
                <Col>
                  <Button
                    size="small"
                    type="ghost-danger"
                    onClick={handleClearAllSelection}
                  >
                    Clear all
                  </Button>
                </Col>
              </Row>
              {selectedEventResults.map((event: CogniteEvent) => {
                return (
                  <EventInfoBox
                    loading={activeEventFilterResults.isLoading}
                    key={event.id}
                    event={event}
                    onToggleEvent={handleSetSelectedEventItems}
                    onViewEvent={handleViewEvent}
                    translations={translations}
                    selected
                  />
                );
              })}
            </>
          ) : (
            ''
          )}

          {activeEventFilterResults && remainingEventResults?.length ? (
            <>
              <Row align="middle" style={{ marginBottom: '8px' }}>
                <Body level={2}>
                  Other results:{' '}
                  <SidebarChip icon="Events" size="medium" $small>
                    {remainingEventResults?.length}
                  </SidebarChip>
                </Body>
              </Row>
              {remainingEventResults?.map((event: CogniteEvent) => {
                return (
                  <EventInfoBox
                    loading={activeEventFilterResults.isLoading}
                    key={event.id}
                    event={event}
                    onToggleEvent={handleSetSelectedEventItems}
                    onViewEvent={handleViewEvent}
                    translations={translations}
                  />
                );
              })}
            </>
          ) : (
            ''
          )}
        </ContentContainer>
      </OverlayContentOverflowWrapper>
    );
  }
);

export default EventResultsSidebar;
