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
  Switch,
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
import {
  FunctionComponentWithTranslationKeys,
  makeDefaultTranslations,
} from 'utils/translations';
import { isThresholdValid } from 'utils/threshold';
import {
  ExpandIcon,
  FilterCollapse,
  FilterSelect,
  SourceSelect,
  ThresholdLabel,
  ThresholdMetadata,
  ThresholdMetadataValue,
} from './elements';

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

const ThresholdItem: FunctionComponentWithTranslationKeys<Props> = ({
  threshold,
  sources,
  onRemoveThreshold,
  onToggleThreshold,
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

  /**
   * Filter min value handling
   */
  const handleEventFilterChange = useCallback(
    (diff: Partial<ChartThresholdEventFilter>) => {
      onEventFilterChange(threshold.id, {
        ...threshold.filter,
        ...diff,
      });
    },
    [onEventFilterChange, threshold.filter, threshold.id]
  );

  const [filterMinValue, setFilterMinValue] = useState(
    String(threshold.filter.minValue)
  );

  const handleFilterMinValueChange = useCallback((event) => {
    setFilterMinValue(event.target.value);
  }, []);

  const handleFilterMinValueUpdateValue = useCallback(() => {
    handleEventFilterChange({
      minValue: parseInt(filterMinValue, 10),
    });
  }, [filterMinValue, handleEventFilterChange]);

  useEffect(() => {
    setFilterMinValue(String(threshold.filter.minValue));
  }, [threshold.filter.minValue]);

  const handleFilterMinValueKeyPress = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        handleFilterMinValueUpdateValue();
      }
    },
    [handleFilterMinValueUpdateValue]
  );

  /**
   * Filter max length handling
   */
  const [filterMaxValue, setFilterMaxValue] = useState(
    String(threshold.filter.maxValue)
  );

  const handleFilterMaxValueChange = useCallback((event) => {
    setFilterMaxValue(event.target.value);
  }, []);

  const handleFilterMaxValueUpdateValue = useCallback(() => {
    handleEventFilterChange({
      maxValue: parseInt(filterMaxValue, 10),
    });
  }, [filterMaxValue, handleEventFilterChange]);

  useEffect(() => {
    setFilterMaxValue(String(threshold.filter.maxValue));
  }, [threshold.filter.maxValue]);

  const handleFilterMaxValueKeyPress = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        handleFilterMaxValueUpdateValue();
      }
    },
    [handleFilterMaxValueUpdateValue]
  );

  return (
    <>
      <ThresholdLabel>{t.Source}</ThresholdLabel>
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
      <ThresholdLabel>{t.Type}:</ThresholdLabel>
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
      <FilterCollapse
        expandIcon={({ isActive }) => (
          <ExpandIcon isActive={!!isActive} type="ChevronDownLarge" />
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
                onChange={handleFilterMinValueChange}
                onBlur={handleFilterMinValueUpdateValue}
                onKeyPress={handleFilterMinValueKeyPress}
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
                onChange={handleFilterMaxValueChange}
                onBlur={handleFilterMaxValueUpdateValue}
                onKeyPress={handleFilterMaxValueKeyPress}
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
      </FilterCollapse>
      <ThresholdMetadata>
        <Flex justifyContent="space-between">
          <p>
            {t['Number of events']}
            <ThresholdMetadataValue>
              {isThresholdValid(threshold) ? result?.count ?? '-' : '-'}
            </ThresholdMetadataValue>
          </p>
          <p>
            {t['Total time']} {threshold.type} {t.threshold}
            <ThresholdMetadataValue>
              {isThresholdValid(threshold) &&
              typeof result?.cumulative_duration === 'number'
                ? convertMSToDisplay(result?.cumulative_duration)
                : '-'}
            </ThresholdMetadataValue>
          </p>
        </Flex>
      </ThresholdMetadata>
      <footer>
        <Flex justifyContent="space-between">
          <Switch
            name={`showThreshold_${threshold.id}`}
            checked={threshold.visible}
            onChange={(val) => {
              if (!showBtnVisibility) return;
              onToggleThreshold(threshold.id, val);
            }}
            disabled={!showBtnVisibility}
          >
            {t.Show}
          </Switch>
          <Popconfirm
            content={`${t['Do you want to delete']} "${threshold.name}"?`}
            onConfirm={() => onRemoveThreshold(threshold.id)}
          >
            <Button type="ghost" icon="Delete" />
          </Popconfirm>
        </Flex>
      </footer>
    </>
  );
};

ThresholdItem.translationKeys = Object.keys(defaultTranslations);

export default ThresholdItem;
