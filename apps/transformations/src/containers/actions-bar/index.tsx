import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common/i18n';
import { CreateTransformationButton } from '@transformations/components';
import DraggableList, {
  DraggableListItem,
  DraggableListItemRenderProps,
} from '@transformations/components/draggable-list';
import SearchTransformations from '@transformations/components/search-transformations';
import TransformationFilter from '@transformations/components/transformation-filter';
import { useTransformationList } from '@transformations/hooks';
import {
  FiltersAction,
  ScheduleStatus,
  FiltersState,
  FilterArrayFields,
  ColumnState,
} from '@transformations/pages/transformation-list/TransformationList';
import {
  collectPages,
  getFilteredTransformationList,
  getTrackEvent,
} from '@transformations/utils';
import { Dropdown } from 'antd';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { SecondaryTopbar } from '@cognite/cdf-utilities';
import {
  Body,
  Button,
  Checkbox,
  Colors,
  Flex,
  Chip,
  Menu,
} from '@cognite/cogs.js';

import { AppliedFilters } from './AppliedFilters';

export type SelectFilterOption = {
  label: string;
  value: string;
  count?: number;
};

export type ActionBarProps = {
  filterState: FiltersState;
  transformationsCount: number;
  filteredTransformationsCount: number;
  lastRunOptions: SelectFilterOption[];
  scheduleOptions: SelectFilterOption[];
  dataSetOptions: SelectFilterOption[];
  dataModelOptions: SelectFilterOption[];
  onFilterChange: (action: FiltersAction) => void;
  columnStates: ColumnState[];
  setColumnStates: Dispatch<SetStateAction<ColumnState[]>>;
};

type DraggableColumnListItemContentProps = DraggableListItemRenderProps & {
  disabled?: boolean;
  onClick: (selected: boolean) => void;
  selected: boolean;
};

const DraggableColumnListItemContent = ({
  disabled,
  key,
  onClick,
  title,
  selected,
}: DraggableColumnListItemContentProps) => {
  return (
    <Flex gap={8}>
      <Checkbox
        checked={selected}
        disabled={disabled}
        name={key}
        onChange={(e) => onClick(e.target.checked)}
      />
      {title}
    </Flex>
  );
};

export const ActionsBar = ({
  filterState,
  transformationsCount,
  filteredTransformationsCount,
  lastRunOptions,
  scheduleOptions,
  dataSetOptions,
  dataModelOptions,
  onFilterChange,
  columnStates,
  setColumnStates,
}: ActionBarProps): JSX.Element => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const { t } = useTranslation();
  const { data } = useTransformationList();

  const parentRef = useRef<HTMLDivElement>(null);

  const transformationList = useMemo(() => collectPages(data), [data]);

  const selectedColumnCount = columnStates.reduce(
    (acc, { selected }) => acc + Number(selected),
    0
  );

  const onSearchChange = (value?: string) => {
    onFilterChange({ type: 'change', field: 'search', payload: value });
    onFilterChange({ type: 'submit' });
  };

  const onCheckboxChange =
    (field: FilterArrayFields, name: string) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      onFilterChange({
        type: e.target.checked ? 'add' : 'remove',
        field,
        payload: name,
      });
    };

  const { lastRun, schedule, dataSet, dataModel, search } = filterState;

  const handleColumnListItemClick = (key: string, selected: boolean) => {
    setColumnStates((prevState) => {
      const currentColumnIndex = prevState.findIndex(
        ({ key: tK }) => tK === key
      );
      if (currentColumnIndex >= 0) {
        return [
          ...prevState.slice(0, currentColumnIndex),
          {
            ...prevState[currentColumnIndex],
            selected,
          },
          ...prevState.slice(currentColumnIndex + 1),
        ];
      }
      return prevState;
    });
  };

  const handleItemOrderChange = (items: DraggableListItem[]) => {
    setColumnStates((prevState) => {
      const nextColumnStates: ColumnState[] = [];
      items.forEach(({ key }) => {
        const columnState = prevState.find(({ key: tK }) => tK === key);
        if (columnState) {
          nextColumnStates.push(columnState);
        }
      });
      return nextColumnStates;
    });
  };

  return (
    <Flex gap={8} direction="column" style={{ marginBottom: 24 }}>
      <SectionWrapper ref={parentRef}>
        <Flex gap={8} alignItems="center">
          <StyledSearchWrapper>
            <SearchTransformations
              onChange={onSearchChange}
              placeHolder={t('filter-by-name')}
              value={search}
            />
          </StyledSearchWrapper>
          <Dropdown
            getPopupContainer={() => parentRef.current as HTMLDivElement}
            overlay={
              <StyledMenu>
                <StyledMenuHeader>
                  <Body level={2} strong>
                    {t('filter-by')}
                  </Body>
                  <Button
                    type="ghost"
                    size="small"
                    onClick={() => {
                      onFilterChange({ type: 'reset' });
                    }}
                  >
                    {t('clear-filters')}
                  </Button>
                </StyledMenuHeader>
                <StyledMenuContent>
                  <StyledMenuSection>
                    <Body level={3} strong>
                      {t('last-run')}
                    </Body>
                    <StyledCheckboxWrapper>
                      {lastRunOptions.map((ele) => (
                        <Flex key={ele.value} justifyContent="space-between">
                          <Checkbox
                            checked={lastRun.includes(ele.value)}
                            name={ele.label}
                            onChange={onCheckboxChange('lastRun', ele.value)}
                          >
                            <Body level={2}>{ele.label}</Body>
                          </Checkbox>
                          <StyledFilterCount
                            label={`${
                              getFilteredTransformationList(
                                transformationList,
                                search ?? '',
                                [ele.value],
                                schedule,
                                dataSet,
                                dataModel
                              ).length
                            }`}
                          />
                        </Flex>
                      ))}
                    </StyledCheckboxWrapper>
                  </StyledMenuSection>
                  <StyledDivider />
                  <StyledMenuSection>
                    <Body level={3} strong>
                      {t('schedule')}
                    </Body>
                    <StyledCheckboxWrapper>
                      {scheduleOptions.map((ele) => {
                        const scheduleValue = ele.value as ScheduleStatus;
                        return (
                          <Flex key={ele.value} justifyContent="space-between">
                            <Checkbox
                              checked={schedule.includes(scheduleValue)}
                              name={ele.label}
                              onChange={onCheckboxChange(
                                'schedule',
                                scheduleValue
                              )}
                            >
                              <Body level={2}>{ele.label}</Body>
                            </Checkbox>
                            <StyledFilterCount
                              label={`${
                                getFilteredTransformationList(
                                  transformationList,
                                  search ?? '',
                                  lastRun,
                                  [scheduleValue],
                                  dataSet,
                                  dataModel
                                ).length
                              }`}
                            />
                          </Flex>
                        );
                      })}
                    </StyledCheckboxWrapper>
                  </StyledMenuSection>
                  <StyledDivider />
                  <StyledMenuSection>
                    <Body level={3} strong>
                      {t('data-set')}
                    </Body>
                    <DataSetSelectFilter
                      options={dataSetOptions}
                      onClear={() => {
                        onFilterChange({
                          type: 'change',
                          field: 'dataSet',
                          payload: '',
                        });
                      }}
                      onChange={(ds) => {
                        onFilterChange({
                          type: 'change',
                          field: 'dataSet',
                          payload: ds.value,
                        });
                      }}
                      value={dataSet || undefined}
                      placeholder={t('create-transformation-select-dataset')}
                    />
                    <StyledWrapper>
                      <Body level={3} strong>
                        {t('target-data-model')}
                      </Body>
                      <DataModelSelectFilter
                        options={dataModelOptions}
                        onClear={() => {
                          onFilterChange({
                            type: 'change',
                            field: 'dataModel',
                            payload: '',
                          });
                        }}
                        onChange={(dm) => {
                          onFilterChange({
                            type: 'change',
                            field: 'dataModel',
                            payload: dm.value,
                          });
                        }}
                        value={dataModel || undefined}
                        placeholder={t(
                          'create-transformation-select-datamodel'
                        )}
                      />
                    </StyledWrapper>
                  </StyledMenuSection>
                </StyledMenuContent>
                <Button
                  type="primary"
                  onClick={() => {
                    trackEvent(
                      getTrackEvent('event-tr-list-filter-apply-click')
                    );
                    onFilterChange({ type: 'submit' });
                    setIsFilterDropdownOpen(false);
                  }}
                >
                  {t('apply')}
                </Button>
              </StyledMenu>
            }
            trigger={['click']}
            placement="bottomLeft"
            open={isFilterDropdownOpen}
            onOpenChange={setIsFilterDropdownOpen}
          >
            <Button
              icon="Filter"
              type="secondary"
              toggled={isFilterDropdownOpen}
            >
              {t('filter_other')}
            </Button>
          </Dropdown>
          <Body level={2} style={{ color: Colors['text-icon--muted'] }}>
            {transformationsCount > filteredTransformationsCount
              ? t('filtered-transformations-count', {
                  count: transformationsCount,
                  filtered: filteredTransformationsCount,
                })
              : t('total-transformations-count', {
                  count: transformationsCount,
                })}
          </Body>
        </Flex>
        <Flex alignItems="center">
          <CreateTransformationButton />
          <SecondaryTopbar.Divider />
          <DraggableList
            items={columnStates.map(({ key, selected, title }) => ({
              key,
              render: (props) => (
                <DraggableColumnListItemContent
                  disabled={selectedColumnCount === 1 && selected}
                  onClick={(selected) =>
                    handleColumnListItemClick(key, selected)
                  }
                  selected={selected}
                  {...props}
                />
              ),
              title,
            }))}
            onChange={handleItemOrderChange}
          />
        </Flex>
      </SectionWrapper>
      <AppliedFilters
        filterState={filterState.applied}
        onFilterChange={onFilterChange}
      />
    </Flex>
  );
};

const StyledWrapper = styled.div`
  margin-top: 16px;
`;

const SectionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledMenu = styled(Menu)`
  padding: 16px;
`;

const StyledMenuHeader = styled(Flex)`
  justify-content: space-between;
  margin-bottom: 12px;
`;

const StyledMenuContent = styled.div`
  background-color: ${Colors['surface--medium']};
  border-radius: 6px;
  margin-bottom: 8px;
`;

const StyledMenuSection = styled.div`
  padding: 12px;
`;

const StyledDivider = styled.div`
  border-bottom: 1px solid ${Colors['border--muted']};
  margin: 4px 0;
`;

const StyledCheckboxWrapper = styled(Flex)`
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
  width: 255px;
`;

const StyledFilterCount = styled(Chip).attrs({
  size: 'x-small',
  type: 'neutral',
})`
  padding: 2px 6px !important;
`;

const DataSetSelectFilter = styled(TransformationFilter)`
  margin-top: 6px;
  width: 100%;
`;

const DataModelSelectFilter = styled(TransformationFilter)`
  margin-top: 6px;
  width: 100%;
`;

const StyledSearchWrapper = styled.div`
  width: 220px;
`;
