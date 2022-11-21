/**
 * Error Sidebar
 */

import { memo, useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isNil, omit, omitBy } from 'lodash';
import { Button, Collapse, Icon, Tooltip } from '@cognite/cogs.js';
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
import EventFilterForm from './EventFilterForm';
import EventInfoBox from './EventInfoBox';

type Props = {
  visible: boolean;
  onClose: () => void;
  chart: Chart;
  updateChart: (update: (c: Chart | undefined) => Chart) => void;
};

const defaultTranslation = makeDefaultTranslations(
  'Events',
  'Hide',
  'New event filter',
  'Event results',
  'Add new filter',
  'Back'
);

const EventSidebar = memo(({ visible, onClose, chart, updateChart }: Props) => {
  const [activeKey, setActiveKey] = useState(['1']);
  const [showEventResults, setShowEventResults] = useState(false);
  const [eventList, setEventList] = useState<CogniteEvent[]>([]);

  const onChange = (key: any) => {
    setActiveKey(key);
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
    const filterCount = chart.eventFilters?.length || 0;
    const eventFilter: ChartEventFilters = {
      id: uuidv4(),
      name: `${t['New event filter']} ${filterCount + 1}`,
      visible: true,
      filters: {},
    };
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

  const handleDuplicateEventFilter = (id: string) => {
    const selectedFilters = chart.eventFilters?.find((f) => f.id === id);
    if (!selectedFilters) throw new Error('Filter was not found');
    const clonedFilter = {
      ...omit(selectedFilters, ['name', 'id']),
      id: uuidv4(),
      name: `${selectedFilters.name} (${t.Duplicate})`,
    };

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
              onClick={() => {
                handleAddEventFilters();
                setActiveKey((prevState) => [
                  '1',
                  ...prevState.map((k) => String(parseInt(k, 10) + 1)),
                ]);
              }}
            >
              {t['Add new filter']}
            </Button>
          </SidebarHeaderActions>
          <SidebarCollapse
            activeKey={activeKey}
            onChange={onChange}
            expandIcon={({ isActive }) => (
              <ExpandIcon $active={Boolean(isActive)} type="ChevronDownLarge" />
            )}
          >
            {chart.eventFilters &&
              chart.eventFilters.map((eventFilter: any) => (
                <Collapse.Panel
                  key={eventFilter.id}
                  header={
                    <CollapsePanelTitle>
                      <TranslatedEditableText
                        value={eventFilter.name}
                        onChange={(val) =>
                          handleRenameEventFilter(eventFilter.id, val)
                        }
                        hideButtons
                      />
                    </CollapsePanelTitle>
                  }
                >
                  <EventFilterForm
                    startDate={chart.dateFrom}
                    endDate={chart.dateTo}
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
            {eventList.map((event) => (
              <EventInfoBox
                key={uuidv4()}
                event={event}
                translations={eventInfoTranslation}
              />
            ))}
          </ContentContainer>
        </OverlayContentOverflowWrapper>
      )}
    </Sidebar>
  );
});

export default EventSidebar;
