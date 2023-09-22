/**
 * Error Sidebar
 */

import { memo, useCallback, useEffect, useState } from 'react';

import { ColorDropdown } from '@charts-app/components/AppearanceDropdown/AppearanceDropdown';
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
  CollapsePanelTitle,
  SidebarFooterActions,
  ReverseSwitch,
} from '@charts-app/components/Common/SidebarElements';
import ClickBoundary from '@charts-app/components/EditableText/ClickBoundary';
import TranslatedEditableText from '@charts-app/components/EditableText/TranslatedEditableText';
import { StyleButton } from '@charts-app/components/StyleButton/StyleButton';
import { useTranslations } from '@charts-app/hooks/translations';
import {
  addEventFilters,
  initEventFilters,
  removeChartEventFilter,
  updateEventFiltersProperties,
} from '@charts-app/models/chart/updates-event-filters';
import { activeEventFilterIdAtom } from '@charts-app/models/event-results/atom';
import { ChartEventResults } from '@charts-app/models/event-results/types';
import { DEFAULT_EVENT_COLOR } from '@charts-app/utils/colors';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { Col, Row } from 'antd';
import { isNil, omit, omitBy } from 'lodash';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { Chart, ChartEventFilters } from '@cognite/charts-lib';
import {
  Button,
  Collapse,
  Dropdown,
  Icon,
  Menu,
  Popconfirm,
  Tooltip,
} from '@cognite/cogs.js';

import EventDetailsSidebar, {
  defaultTranslations as eventDetailDefaultTranslations,
} from './EventDetailSidebar';
import EventFilterForm from './EventFilterForm';
import EventInfoBox from './EventInfoBox';
import EventResultsSidebar from './EventResultsSidebar';

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
  'Confirm',
  'Cancel'
);

const EventSidebar = memo(
  ({ visible, onClose, chart, updateChart, eventData }: Props) => {
    const [activeKeys, setActiveKeys] = useState([
      chart.eventFilters?.length ? chart.eventFilters[0].id : '',
    ]);

    const [showEventResults, setShowEventResults] = useState(false);
    const [showEventDetail, setShowEventDetail] = useState(false);

    const [, setActiveEventFilterId] = useRecoilState(activeEventFilterIdAtom);

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

    const eventDetailTranslation = {
      ...eventDetailDefaultTranslations,
      ...useTranslations(
        Object.keys(eventDetailDefaultTranslations),
        'EventDetailBox'
      ).t,
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

    /** View result list sidebar */
    const toggleShowSearchResults = useCallback((id: string) => {
      setActiveEventFilterId(id);
      setShowEventResults((prevState) => !prevState);
    }, []);

    /** View single event details sidebar */
    const toggleShowEventDetail = useCallback(() => {
      setShowEventDetail((prevState) => !prevState);
    }, []);

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
                    <>
                      <EventFilterForm
                        eventData={eventData.find(
                          (f) => f.id === eventFilter.id
                        )}
                        eventFilter={eventFilter}
                        setFilters={handleUpdateFilterProps}
                        onShowEventResults={toggleShowSearchResults}
                        dateFrom={chart.dateFrom}
                        dateTo={chart.dateTo}
                        translations={t}
                      />
                      <SidebarFooterActions>
                        <Row justify="space-between" align="middle">
                          <Col span={8}>
                            <Popconfirm
                              maxWidth={390}
                              content={`${t.Delete} "${eventFilter.name}"?`}
                              onConfirm={() =>
                                handleDeleteEventFilter(eventFilter.id)
                              }
                              okText={t.Confirm}
                              cancelText={t.Cancel}
                            >
                              <Button
                                type="ghost-destructive"
                                icon="Delete"
                                aria-label="Delete"
                              />
                            </Popconfirm>
                            <Popconfirm
                              maxWidth={390}
                              content={`${t.Duplicate} "${eventFilter.name}"?`}
                              onConfirm={() =>
                                handleDuplicateEventFilter(eventFilter.id)
                              }
                              okText={t.Confirm}
                              cancelText={t.Cancel}
                            >
                              <Button
                                type="ghost"
                                icon="Duplicate"
                                aria-label="Duplicate"
                              />
                            </Popconfirm>
                          </Col>
                          <Col>
                            <ReverseSwitch
                              name={`showEvents_${eventFilter.id}`}
                              checked={eventFilter.visible}
                              label={t['Show / hide']}
                              onChange={() => {
                                handleToggleEventFilter(
                                  eventFilter.id,
                                  !eventFilter.visible
                                );
                              }}
                            />
                          </Col>
                        </Row>
                      </SidebarFooterActions>
                    </>
                  </Collapse.Panel>
                ))}
            </SidebarCollapse>
          </ContentContainer>
        </ContentOverflowWrapper>
        {showEventResults && eventData && (
          <EventResultsSidebar
            onCloseEventResults={toggleShowSearchResults}
            onShowEventDetail={toggleShowEventDetail}
            translations={eventInfoTranslation}
          />
        )}
        {showEventDetail && eventData && (
          <EventDetailsSidebar
            onCloseEventDetail={toggleShowEventDetail}
            translations={eventDetailTranslation}
          />
        )}
      </Sidebar>
    );
  }
);

export default EventSidebar;
