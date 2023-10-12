import { useCallback, useEffect, useState, ChangeEvent } from 'react';

import { Col, Row } from 'antd';

import {
  ChartSource,
  ChartThreshold,
  ChartThresholdEventFilter,
  ChartTimeSeries,
  ChartWorkflow,
} from '@cognite/charts-lib';
import {
  Button,
  Collapse,
  Flex,
  Input,
  Popconfirm,
  Select,
} from '@cognite/cogs.js';

import useThresholdsResults from '../../hooks/threshold-calculations';
import { convertMSToDisplay } from '../../utils/date';
import { isThresholdValid } from '../../utils/threshold';
import {
  makeDefaultTranslations,
  translationKeys,
} from '../../utils/translations';
import { getUnitConverter } from '../../utils/units';
import {
  ReverseSwitch,
  ExpandIcon,
  SidebarInnerCollapse,
  FilterSelect,
  SidebarFormLabel,
  SidebarInnerBox,
  SidebarChip,
} from '../Common/SidebarElements';
import { SourceSelector } from '../Common/SourceSelector';

import { useFilterValue } from './useFilterValue';

const defaultTranslations = makeDefaultTranslations(
  'Thresholds',
  'Source',
  'Type',
  'Over',
  'Under',
  'Between',
  'Min',
  'Max',
  'Filter event length',
  'Number of events',
  'Total time',
  'threshold',
  'Show',
  'Hide',
  'Value',
  'Do you want to delete',
  'Add new',
  'Cancel',
  'Confirm',
  'seconds',
  'minutes',
  'hours',
  'New threshold',
  'Duplicate'
);

type OptionType = {
  value: string;
  label: string;
};

type Props = {
  threshold: ChartThreshold;
  sources: ChartSource[];
  onRemoveThreshold: (diff: any) => void;
  onToggleThreshold: (id: string, visibility: boolean) => void;
  onDuplicateThreshold: (id: string) => void;
  onSelectSource: (id: string, diff: any) => void;
  onTypeChange: (id: string, diff: any) => void;
  onLowerLimitChange: (id: string, diff: any) => void;
  onUpperLimitChange: (id: string, diff: any) => void;
  onEventFilterChange: (id: string, diff: any) => void;
  translations?: typeof defaultTranslations;
  _useThresholds?: typeof useThresholdsResults;
  expandFilters?: boolean;
};

const ThresholdItem = ({
  threshold,
  sources,
  onRemoveThreshold,
  onToggleThreshold,
  onDuplicateThreshold,
  onSelectSource,
  onTypeChange,
  onLowerLimitChange,
  onUpperLimitChange,
  onEventFilterChange,
  translations,
  _useThresholds = useThresholdsResults,
  expandFilters,
}: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };

  const typeOptions: OptionType[] = [
    {
      value: 'between',
      label: t.Between,
    },
    {
      value: 'over',
      label: t.Over,
    },
    {
      value: 'under',
      label: t.Under,
    },
  ];

  const filterLengthOptions: OptionType[] = [
    {
      value: 'seconds',
      label: t.seconds,
    },
    {
      value: 'minutes',
      label: t.minutes,
    },
    {
      value: 'hours',
      label: t.hours,
    },
  ];

  const selectedTypeOption = typeOptions.find(
    (item) => item.value === threshold.type
  );

  const selectedMinUnitOption = filterLengthOptions.find(
    (item) => item.value === threshold.filter.minUnit
  );

  const selectedMaxUnitOption = filterLengthOptions.find(
    (item) => item.value === threshold.filter.maxUnit
  );

  const selectedSource = sources.find(
    (source) => source.id === threshold.sourceId
  );

  /** Form elements visibility */
  const upperLimitVisibility = threshold.type !== 'over';
  const lowerLimitVisibility = threshold.type !== 'under';
  const showBtnVisibility = isThresholdValid(threshold);

  const selectedSourceType = selectedSource?.type || 'timeseries';

  const identifier =
    selectedSourceType === 'timeseries'
      ? (selectedSource as ChartTimeSeries)?.tsExternalId
      : (selectedSource as ChartWorkflow)?.calls?.[0]?.callId;

  const { data, isLoading } = _useThresholds(
    threshold,
    selectedSourceType!,
    identifier!
  );

  const result = data ? data.results : undefined;

  const currentInputUnit = selectedSource?.unit;
  const currentOutputUnit = selectedSource?.preferredUnit;

  const convertFromOriginalToPreferredUnit = getUnitConverter(
    currentInputUnit,
    currentOutputUnit
  );

  const convertFromPreferredToOriginalUnit = getUnitConverter(
    currentOutputUnit,
    currentInputUnit
  );

  /**
   * Lower limit handling
   */
  const convertedLowerLimit = convertFromOriginalToPreferredUnit(
    threshold.lowerLimit
  );

  const [lowerLimit, setLowerLimit] = useState(String(convertedLowerLimit));

  useEffect(() => {
    setLowerLimit(String(convertedLowerLimit));
  }, [convertedLowerLimit]);

  const handleLowerLimitChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setLowerLimit(event.target.value);
    },
    []
  );

  const handleLowerLimitUpdateValue = useCallback(() => {
    // convert local state back to original unit before updating underlying data
    const convertedValue = convertFromPreferredToOriginalUnit(
      parseFloat(lowerLimit)
    );
    onLowerLimitChange(threshold.id, convertedValue);
  }, [
    threshold.id,
    onLowerLimitChange,
    lowerLimit,
    convertFromPreferredToOriginalUnit,
  ]);

  const handleLowerLimitKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleLowerLimitUpdateValue();
      }
    },
    [handleLowerLimitUpdateValue]
  );

  /**
   * Upper limit handling
   */
  const convertedUpperLimit = convertFromOriginalToPreferredUnit(
    threshold.upperLimit
  );

  const [upperLimit, setUpperLimit] = useState(String(convertedUpperLimit));

  useEffect(() => {
    // convert units before updating local state
    setUpperLimit(String(convertedUpperLimit));
  }, [convertedUpperLimit]);

  const handleUpperLimitChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setUpperLimit(event.target.value);
    },
    []
  );

  const handleUpperLimitUpdateValue = useCallback(() => {
    // convert local state back to original unit before updating underlying data
    const convertedValue = convertFromPreferredToOriginalUnit(
      parseFloat(upperLimit)
    );
    onUpperLimitChange(threshold.id, convertedValue);
  }, [
    threshold.id,
    onUpperLimitChange,
    upperLimit,
    convertFromPreferredToOriginalUnit,
  ]);

  const handleUpperLimitKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleUpperLimitUpdateValue();
      }
    },
    [handleUpperLimitUpdateValue]
  );

  const handleEventFilterChange = useCallback(
    (diff: Partial<ChartThresholdEventFilter>) => {
      onEventFilterChange(threshold.id, {
        ...threshold.filter,
        ...diff,
      });
    },
    [onEventFilterChange, threshold.filter, threshold.id]
  );

  /**
   * Filter min value handling
   */
  const [
    filterMinValue,
    handleMinValueChange,
    handleMinValueKeyPress,
    handleMinValueUpdate,
  ] = useFilterValue({
    defaultValue: threshold.filter.minValue,
    filterKey: 'minValue',
    onEventFilterUpdate: handleEventFilterChange,
  });

  /**
   * Filter max length handling
   */
  const [
    filterMaxValue,
    handleMaxValueChange,
    handleMaxValueKeyPress,
    handleMaxValueUpdate,
  ] = useFilterValue({
    defaultValue: threshold.filter.maxValue,
    filterKey: 'maxValue',
    onEventFilterUpdate: handleEventFilterChange,
  });

  return (
    <>
      <SidebarFormLabel>{t.Source}</SidebarFormLabel>
      <SourceSelector
        onChange={(source: ChartSource) => onSelectSource(threshold.id, source)}
        value={selectedSource}
      />
      <SidebarFormLabel>{t.Type}:</SidebarFormLabel>
      <Row justify="space-between" gutter={8}>
        <Col span={12}>
          <Select
            options={typeOptions}
            value={selectedTypeOption}
            onChange={(type: OptionType) =>
              onTypeChange(threshold.id, type.value)
            }
          />
        </Col>
        {lowerLimitVisibility && (
          <Col span={threshold.type !== 'between' ? 12 : 6}>
            <Input
              type="number"
              value={lowerLimit}
              onChange={handleLowerLimitChange}
              onBlur={handleLowerLimitUpdateValue}
              onKeyPress={handleLowerLimitKeyPress}
              placeholder={threshold.type === 'between' ? t.Min : t.Value}
              fullWidth
            />
          </Col>
        )}
        {upperLimitVisibility && (
          <Col span={threshold.type !== 'between' ? 12 : 6}>
            <Input
              type="number"
              value={upperLimit}
              onChange={handleUpperLimitChange}
              onBlur={handleUpperLimitUpdateValue}
              onKeyPress={handleUpperLimitKeyPress}
              placeholder={threshold.type === 'between' ? t.Max : t.Value}
              fullWidth
            />
          </Col>
        )}
      </Row>
      <SidebarInnerCollapse
        expandIcon={({ isActive }) => (
          <ExpandIcon $active={!!isActive} type="ChevronDownLarge" />
        )}
        defaultActiveKey={expandFilters ? 'panelFilterForm' : ''}
        ghost
      >
        <Collapse.Panel header={t['Filter event length']} key="panelFilterForm">
          <Row justify="space-between" gutter={8}>
            <Col span={7}>
              <Input
                type="number"
                name="filterMin"
                placeholder={t.Min}
                onChange={handleMinValueChange}
                onKeyPress={handleMinValueKeyPress}
                onBlur={handleMinValueUpdate}
                value={filterMinValue}
                fullWidth
              />
            </Col>
            <Col span={5}>
              <FilterSelect
                options={filterLengthOptions}
                placeholder=""
                value={selectedMinUnitOption}
                onChange={(type: OptionType) =>
                  handleEventFilterChange({ minUnit: type.value })
                }
              />
            </Col>
            <Col span={7}>
              <Input
                type="number"
                name="filterMax"
                placeholder={t.Max}
                onChange={handleMaxValueChange}
                onKeyPress={handleMaxValueKeyPress}
                onBlur={handleMaxValueUpdate}
                value={filterMaxValue}
                fullWidth
              />
            </Col>
            <Col span={5}>
              <FilterSelect
                placeholder=""
                options={filterLengthOptions}
                value={selectedMaxUnitOption}
                onChange={(type: OptionType) =>
                  handleEventFilterChange({ maxUnit: type.value })
                }
              />
            </Col>
          </Row>
        </Collapse.Panel>
      </SidebarInnerCollapse>
      <SidebarInnerBox>
        <Flex justifyContent="space-between">
          <p>
            {t['Number of events']} <br />
            {isLoading ? (
              <SidebarChip icon="Loader" size="small" />
            ) : (
              <SidebarChip
                icon="Events"
                size="small"
                label={
                  isThresholdValid(threshold) ? `${result?.count}` ?? '-' : '-'
                }
              />
            )}
          </p>
          <p>
            {t['Total time']} {threshold.type} {t.threshold} <br />
            {isLoading ? (
              <SidebarChip icon="Loader" size="small" />
            ) : (
              <SidebarChip
                icon="Clock"
                size="small"
                label={
                  isThresholdValid(threshold) &&
                  typeof result?.cumulative_duration === 'number'
                    ? convertMSToDisplay(result?.cumulative_duration)
                    : '-'
                }
              />
            )}
          </p>
        </Flex>
      </SidebarInnerBox>
      <footer>
        <Flex justifyContent="space-between">
          <div>
            <Popconfirm
              content={`${t['Do you want to delete']} "${threshold.name}"?`}
              onConfirm={() => onRemoveThreshold(threshold.id)}
              okText={t.Confirm}
              cancelText={t.Cancel}
            >
              <Button
                type="ghost-destructive"
                icon="Delete"
                aria-label="Delete"
              />
            </Popconfirm>
            <Button
              type="ghost"
              onClick={() => onDuplicateThreshold(threshold.id)}
              icon="Duplicate"
              aria-label="Duplicate"
            />
          </div>
          <ReverseSwitch
            name={`showThreshold_${threshold.id}`}
            checked={threshold.visible}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              if (!showBtnVisibility) return;
              onToggleThreshold(threshold.id, event.target.checked);
            }}
            disabled={!showBtnVisibility}
            label={t.Show}
          />
        </Flex>
      </footer>
    </>
  );
};

ThresholdItem.translationKeys = translationKeys(defaultTranslations);
ThresholdItem.defaultTranslations = defaultTranslations;
ThresholdItem.translationNamespace = 'ThresholdItem';

export default ThresholdItem;
