/**
 * Error Sidebar
 */

import { memo, useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isNil, omit, omitBy } from 'lodash';
import {
  Button,
  Collapse,
  Dropdown,
  Icon,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';
import { CogniteEvent } from '@cognite/sdk';

import {
  ExpandIcon,
  Sidebar,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
  ContentOverflowWrapper,
  ContentContainer,
  SidebarHeaderActions,
  SidebarCollapse,
  OverlayContentOverflowWrapper,
  CollapsePanelTitle,
} from 'components/Common/SidebarElements';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import { Chart, ChartEventFilters } from 'models/chart/types';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';
import {
  addEventFilters,
  initEventFilters,
  removeChartEventFilter,
  updateEventFiltersProperties,
} from 'models/chart/updates-event-filters';
import { useRecoilState } from 'recoil';
import { selectedEventsAtom } from 'models/event-results/atom';
import {
  ChartEventResults,
  EventsCollection,
  EventsEntry,
} from 'models/event-results/types';
import { StyleButton } from 'components/StyleButton/StyleButton';
import { Col, Row } from 'antd';
import { ColorDropdown } from 'components/AppearanceDropdown/AppearanceDropdown';
import ClickBoundary from 'components/EditableText/ClickBoundary';
import { DEFAULT_EVENT_COLOR } from 'utils/colors';
import EventFilterForm from './EventFilterForm';
import EventInfoBox from './EventInfoBox';
import { isEventSelected } from './helpers';

type Props = {
  visible: boolean;
  onClose: () => void;
  chart: Chart;
  updateChart: (update: (c: Chart | undefined) => Chart) => void;
  eventData: ChartEventResults[];
};

const defaultTranslation = makeDefaultTranslations(
  'Events',
  'Hide',
  'New event filter',
  'Event results',
  'Add new filter',
  'Back'
);

const EventSidebar = memo(
  ({ visible, onClose, chart, updateChart, eventData }: Props) => {
    const [activeKeys, setActiveKeys] = useState([
      chart.eventFilters?.length ? chart.eventFilters[0].id : '',
    ]);

    const [showEventResults, setShowEventResults] = useState(false);
    const [eventList, setEventList] = useState<CogniteEvent[]>([]);

    const handleToggleAccordian = (key: any) => {
      setActiveKeys(key);
    };

    const t = {
      ...defaultTranslation,
      ...useTranslations(Object.keys(defaultTranslation), 'EventSidebar').t,
      ...useTranslations(EventFilterForm.translationKeys, 'EventSidebar').t,
    };

    const eventInfoTranslation = {
      ...useTranslations(EventInfoBox.translationKeys, 'EventInfoBox').t,
    };

    const handleAddEventFilters = () => {
      const id = uuidv4();
      const filterCount = chart.eventFilters?.length || 0;
      const eventFilter: ChartEventFilters = {
        id,
        name: `${t['New event filter']} ${filterCount + 1}`,
        visible: true,
        color: DEFAULT_EVENT_COLOR,
        filters: {},
      };
      setActiveKeys((prevState) => [id, ...prevState]);
      updateChart((oldChart) => addEventFilters(oldChart!, eventFilter));
    };

    const handleDeleteEventFilter = (id: string) => {
      updateChart((oldChart) => removeChartEventFilter(oldChart!, id));
    };

    const handleRenameEventFilter = (id: string, name: string) => {
      updateChart((oldChart) =>
        updateEventFiltersProperties(oldChart!, id, { name })
      );
    };

    const handleToggleEventFilter = (id: string, visibility: boolean) => {
      updateChart((oldChart) =>
        updateEventFiltersProperties(oldChart!, id, { visible: visibility })
      );
    };

    const handleChangeEventColor = (id: string, color: string) => {
      updateChart((oldChart) =>
        updateEventFiltersProperties(oldChart!, id, { color })
      );
    };

    const handleDuplicateEventFilter = (id: string) => {
      const selectedFilters = chart.eventFilters?.find((f) => f.id === id);
      const newId = uuidv4();
      if (!selectedFilters) throw new Error('Filter was not found');
      const clonedFilter = {
        ...omit(selectedFilters, ['name', 'id']),
        id: newId,
        name: `${selectedFilters.name} (${t.Duplicate})`,
      };

      setActiveKeys((prevState) => [newId, ...prevState]);
      updateChart((oldChart) => addEventFilters(oldChart!, clonedFilter));
    };

    const handleUpdateFilterProps = (
      id: string,
      updatedFilter: Partial<ChartEventFilters['filters']>
    ) => {
      const pureFilters = omitBy(updatedFilter, isNil);
      updateChart((oldChart) =>
        updateEventFiltersProperties(oldChart!, id, {
          filters: pureFilters,
        })
      );
    };

    const toggleShowSearchResults = useCallback((values) => {
      setEventList(values);
      setShowEventResults((prevState) => !prevState);
    }, []);

    const [selectedEvents, setSelectedEvents] =
      useRecoilState(selectedEventsAtom);

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

    useEffect(() => {
      if (!chart.eventFilters || chart.eventFilters === undefined) {
        updateChart((oldChart) => initEventFilters(oldChart!));
      }
    }, [chart, updateChart]);

    return (
      <Sidebar visible={visible}>
        <TopContainer>
          <TopContainerTitle>
            <Icon size={21} type="Events" />
            {showEventResults ? t['Event results'] : t.Events}
          </TopContainerTitle>
          <TopContainerAside>
            <Tooltip content={t.Hide}>
              <Button
                icon="Close"
                type="ghost"
                onClick={onClose}
                aria-label="Close"
              />
            </Tooltip>
          </TopContainerAside>
        </TopContainer>
        <ContentOverflowWrapper>
          <ContentContainer>
            <SidebarHeaderActions>
              <Button
                icon="Plus"
                type="primary"
                size="small"
                aria-label="Add event filter"
                onClick={handleAddEventFilters}
              >
                {t['Add new filter']}
              </Button>
            </SidebarHeaderActions>
            <SidebarCollapse
              activeKey={activeKeys}
              onChange={handleToggleAccordian}
              expandIcon={({ isActive }) => (
                <ExpandIcon
                  $active={Boolean(isActive)}
                  type="ChevronDownLarge"
                />
              )}
            >
              {chart.eventFilters &&
                chart.eventFilters.map((eventFilter: ChartEventFilters) => (
                  <Collapse.Panel
                    key={eventFilter.id}
                    header={
                      <CollapsePanelTitle>
                        <Row align="middle" wrap={false}>
                          <Col>
                            <ClickBoundary>
                              <Dropdown
                                content={
                                  <Menu>
                                    <ColorDropdown
                                      selectedColor={
                                        eventFilter.color || DEFAULT_EVENT_COLOR
                                      }
                                      onColorSelected={(newColor) =>
                                        handleChangeEventColor(
                                          eventFilter.id,
                                          newColor
                                        )
                                      }
                                      label="Color options"
                                      showLabel={false}
                                    />
                                  </Menu>
                                }
                              >
                                <StyleButton
                                  style={{ marginTop: '6px' }}
                                  styleColor={
                                    eventFilter.color || DEFAULT_EVENT_COLOR
                                  }
                                  size="small"
                                  label="Choose event overlay color"
                                  title="Choose event overlay color"
                                />
                              </Dropdown>
                            </ClickBoundary>
                          </Col>
                          <Col offset={1}>
                            <TranslatedEditableText
                              value={eventFilter.name}
                              onChange={(val) =>
                                handleRenameEventFilter(eventFilter.id, val)
                              }
                              hideButtons
                            />
                          </Col>
                        </Row>
                      </CollapsePanelTitle>
                    }
                  >
                    <EventFilterForm
                      items={
                        eventData.find((f) => f.id === eventFilter.id)?.results
                      }
                      eventFilters={eventFilter}
                      setFilters={handleUpdateFilterProps}
                      onDeleteEventFilter={handleDeleteEventFilter}
                      onToggleEventFilter={handleToggleEventFilter}
                      onDuplicateEventFilter={handleDuplicateEventFilter}
                      onShowEventResults={toggleShowSearchResults}
                      translations={t}
                    />
                  </Collapse.Panel>
                ))}
            </SidebarCollapse>
          </ContentContainer>
        </ContentOverflowWrapper>
        {showEventResults && (
          <OverlayContentOverflowWrapper>
            <ContentContainer>
              <SidebarHeaderActions>
                <Button
                  onClick={() => toggleShowSearchResults([])}
                  icon="ArrowLeft"
                  size="small"
                  aria-label="Back"
                >
                  {t.Back}
                </Button>
              </SidebarHeaderActions>
              {eventList.map((event) => {
                const eventSelected = isEventSelected(selectedEvents, event);
                return (
                  <EventInfoBox
                    key={event.id}
                    event={event}
                    selected={!!eventSelected}
                    onToggleEvent={handleSetSelectedEventItems}
                    translations={eventInfoTranslation}
                  />
                );
              })}
            </ContentContainer>
          </OverlayContentOverflowWrapper>
        )}
      </Sidebar>
    );
  }
);

export default EventSidebar;
