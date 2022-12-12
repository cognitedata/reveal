import dayjs from 'dayjs';
import { BenchmarkingFilters as BenchmarkingFiltersComponent } from 'components/BenchmarkingFilters/BenchmarkingFilters';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  BenchmarkingFilterType,
  BenchmarkingWaterCourses,
  BenchmarkingFilters,
} from '@cognite/power-ops-api-types';
import { BenchmarkingTypeOption } from 'types';

import { timeFrameOptions, timeFrameStartDates } from './utils';

type Props = {
  priceAreaId: string;
  benchmarkingFilters: BenchmarkingFilters;
  showFirstRuns: boolean;
  onFilterChange: (filter: BenchmarkingFilterType) => void;
  onTypeChange: (type: BenchmarkingTypeOption) => void;
  onShowFirstRunsChange: (showFirstRuns: boolean) => void;
};

const BenchmarkingFiltersContainer = ({
  priceAreaId,
  benchmarkingFilters,
  showFirstRuns,
  onFilterChange,
  onTypeChange,
  onShowFirstRunsChange,
}: Props) => {
  const history = useHistory();
  const { pathname, search } = useLocation();
  const urlParams = new URLSearchParams(search);

  const [watercourseFilterOptions, setWatercourseFilterOptions] = useState<
    BenchmarkingWaterCourses['methods']
  >([]);
  const [watercourseValue, setWatercourseValue] =
    useState<BenchmarkingWaterCourses['methods'][number]>();
  const [typeFilterOptions, setTypeFilterOptions] = useState<
    BenchmarkingWaterCourses['methods']
  >([]);
  const [typeValue, setTypeValue] = useState<BenchmarkingTypeOption>('');
  const [metricFilterOptions, setMetricFilterOptions] = useState<
    BenchmarkingWaterCourses['methods']
  >([]);
  const [metricValue, setMetricValue] =
    useState<BenchmarkingWaterCourses['methods'][number]>();

  const [timeFrameValue, setTimeFrameValue] = useState<
    typeof timeFrameOptions[number]
  >(() => {
    // if it exists from URL, fill it up
    if (urlParams.get('timeFrame')) {
      const found = timeFrameOptions.find(
        (timeFrame) => timeFrame.value === urlParams.get('timeFrame')
      );
      if (found) return found;
    }
    return timeFrameOptions[0];
  });

  const handleWatercourseValueChange = (
    newValue: BenchmarkingWaterCourses['methods'][number]
  ) => {
    const methods =
      benchmarkingFilters?.waterCourses?.find(
        (data: BenchmarkingWaterCourses) => data.name === newValue?.value
      )?.methods || [];
    setTypeFilterOptions(methods);
    setTypeValue(
      typeValue && methods.some((method) => method.value === typeValue)
        ? typeValue
        : methods[0].value || ''
    );
    setWatercourseValue(newValue);
  };

  const getMetricFromUrlParam = (
    selectedMetric: BenchmarkingFilters['metrics'][number]['value'] | null
  ): BenchmarkingFilters['metrics'][number] => {
    if (!benchmarkingFilters?.metrics) return { value: '', label: '' };
    if (selectedMetric) {
      return (
        benchmarkingFilters.metrics.find(
          (metric) => metric.value === selectedMetric
        ) ?? { value: '', label: '' }
      );
    }
    return (
      // Default metric is 'grand_total'
      benchmarkingFilters.metrics.find(
        (metric) => metric.value === 'grand_total'
      ) ?? { value: '', label: '' }
    );
  };

  useEffect(() => {
    const watercourseFilterOptions =
      benchmarkingFilters.waterCourses.map(
        (watercourse: BenchmarkingWaterCourses) => {
          return {
            value: watercourse.name,
            label: watercourse.name,
          };
        }
      ) || [];
    setWatercourseFilterOptions(watercourseFilterOptions);

    const watercourseValue = urlParams.get('waterCourse')
      ? {
          value:
            benchmarkingFilters.waterCourses.find(
              (watercourse) => watercourse.name === urlParams.get('waterCourse')
            )?.name || '',
          label:
            benchmarkingFilters.waterCourses.find(
              (watercourse) => watercourse.name === urlParams.get('waterCourse')
            )?.name || '',
        }
      : watercourseFilterOptions[0];
    setWatercourseValue(watercourseValue);

    const typeFilterOptions =
      benchmarkingFilters.waterCourses.find(
        (watercourse) => watercourse.name === watercourseValue?.value
      )?.methods || [];
    setTypeFilterOptions(typeFilterOptions);
    setTypeValue(urlParams.get('type') || typeFilterOptions[0]?.value);

    setMetricFilterOptions(benchmarkingFilters.metrics);
    setMetricValue(getMetricFromUrlParam(urlParams.get('metric')));

    if (urlParams.get('showFirstRuns')) {
      onShowFirstRunsChange(urlParams.get('showFirstRuns') === 'true');
    }
  }, [benchmarkingFilters]);

  useEffect(() => {
    if (!watercourseValue?.value || !metricValue?.value || !typeValue) return;

    // Get startDate based on timeFrameValue
    const startDate =
      timeFrameStartDates[timeFrameOptions.indexOf(timeFrameValue)];

    const newFilters = {
      priceAreaId: priceAreaId.split('_')[2],
      market: 'day-ahead',
      waterCourse: watercourseValue?.value,
      metric: metricValue?.value,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
    };

    onFilterChange(newFilters);
    onTypeChange(typeValue);

    history.push({
      pathname,
      search: new URLSearchParams({
        waterCourse: watercourseValue?.value,
        metric: metricValue?.value,
        type: typeValue,
        timeFrame: timeFrameValue.value,
        showFirstRuns: `${showFirstRuns}`,
      }).toString(),
    });
  }, [watercourseValue, typeValue, metricValue, timeFrameValue, showFirstRuns]);

  return (
    <BenchmarkingFiltersComponent
      watercourseValue={watercourseValue}
      watercourseFilterOptions={watercourseFilterOptions}
      onWatercourseValueChange={handleWatercourseValueChange}
      typeValue={typeValue}
      typeFilterOptions={typeFilterOptions}
      onTypeValueChange={setTypeValue}
      metricValue={metricValue}
      metricFilterOptions={metricFilterOptions}
      onMetricValueChange={setMetricValue}
      timeFrameValue={timeFrameValue}
      timeFrameOptions={timeFrameOptions}
      onTimeFrameValueChange={setTimeFrameValue}
      showFirstRuns={showFirstRuns}
      onShowFirstRunsChange={onShowFirstRunsChange}
    />
  );
};

export default BenchmarkingFiltersContainer;
