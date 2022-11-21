import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Collapse,
  Flex,
  IconType,
  Input,
  OptionsType,
  Popconfirm,
  Select,
} from '@cognite/cogs.js';
import { Col, Row } from 'antd';
import useThresholdsResults from 'hooks/threshold-calculations';
import {
  ChartThreshold,
  ChartThresholdEventFilter,
  ChartTimeSeries,
  ChartWorkflow,
} from 'models/chart/types';
import convertMSToDisplay from 'utils/date';
import { getUnitConverter } from 'utils/units';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';
import { isThresholdValid } from 'utils/threshold';
import {
  ReverseSwitch,
  ExpandIcon,
  SidebarInnerCollapse,
  FilterSelect,
  SourceSelect,
  SidebarFormLabel,
  SidebarInnerBox,
  SidebarChip,
} from 'components/Common/SidebarElements';

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
  'Do you want to delete'
);

type OptionType = {
  value: string;
  label: string;
};

type Props = {
  threshold: ChartThreshold;
  sources: (ChartTimeSeries | ChartWorkflow)[];
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

const typeOptions: OptionType[] = [
  {
    value: 'between',
    label: 'Between',
  },
  {
    value: 'over',
    label: 'Over',
  },
  {
    value: 'under',
    label: 'Under',
  },
];

const filterLengthOptions: OptionsType[] = [
  {
    value: 'seconds',
    label: 's',
  },
  {
    value: 'minutes',
    label: 'm',
  },
  {
    value: 'hours',
    label: 'h',
  },
];

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

  const { data } = _useThresholds(threshold, selectedSourceType!, identifier!);

  const result = data ? data.results : undefined;

  const selectedOptionIcon: IconType =
    sources.find((item) => item.id === selectedSource?.id)?.type === 'workflow'
      ? 'Function'
      : 'Timeseries';

  const selectedOptionColor: string =
    sources.find((item) => item.id === selectedSource?.id)?.color || '#ccc';

  const sourceOptions: OptionType[] = sources.map((item) => ({
    value: item.id,
    label: item.name,
  }));

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

  const handleLowerLimitChange = useCallback((event) => {
    setLowerLimit(event.target.value);
  }, []);

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
    (event) => {
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

  const handleUpperLimitChange = useCallback((event) => {
    setUpperLimit(event.target.value);
  }, []);

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
    (event) => {
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
      <SourceSelect
        iconBg={selectedOptionColor}
        options={sourceOptions}
        icon={selectedOptionIcon}
        value={{
          value: selectedSource?.id || 'not-selected',
          label: selectedSource?.name || 'Please select',
        }}
        onChange={(source: OptionType) => onSelectSource(threshold.id, source)}
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
            <SidebarChip icon="Events" size="medium">
              {isThresholdValid(threshold) ? result?.count ?? '-' : '-'}
            </SidebarChip>
          </p>
          <p>
            {t['Total time']} {threshold.type} {t.threshold} <br />
            <SidebarChip icon="Clock" size="medium">
              {isThresholdValid(threshold) &&
              typeof result?.cumulative_duration === 'number'
                ? convertMSToDisplay(result?.cumulative_duration)
                : '-'}
            </SidebarChip>
          </p>
        </Flex>
      </SidebarInnerBox>
      <footer>
        <Flex justifyContent="space-between">
          <div>
            <Popconfirm
              content={`${t['Do you want to delete']} "${threshold.name}"?`}
              onConfirm={() => onRemoveThreshold(threshold.id)}
            >
              <Button type="ghost-danger" icon="Delete" aria-label="Delete" />
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
            onChange={(val) => {
              if (!showBtnVisibility) return;
              onToggleThreshold(threshold.id, val);
            }}
            disabled={!showBtnVisibility}
          >
            {t.Show}
          </ReverseSwitch>
        </Flex>
      </footer>
    </>
  );
};

ThresholdItem.translationKeys = translationKeys(defaultTranslations);
ThresholdItem.defaultTranslations = defaultTranslations;
ThresholdItem.translationNamespace = 'ThresholdItem';

export default ThresholdItem;
