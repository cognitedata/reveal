import { Select, Switch } from '@cognite/cogs.js';
import { BenchmarkingTypeSelect } from 'components/BenchmarkingTypeFilter/BenchmarkingTypeFilter';
import { BenchmarkingWaterCourses } from '@cognite/power-ops-api-types';
import { BenchmarkingTypeOption } from 'types';

import { Container } from './elements';
import { timeFrameOptions } from './utils';

type Props = {
  watercourseValue: BenchmarkingWaterCourses['methods'][number] | undefined;
  watercourseFilterOptions: BenchmarkingWaterCourses['methods'];
  onWatercourseValueChange: (
    watercourseValue: BenchmarkingWaterCourses['methods'][number]
  ) => void;
  typeValue: BenchmarkingTypeOption | undefined;
  typeFilterOptions: BenchmarkingWaterCourses['methods'];
  onTypeValueChange: (typeValue: string) => void;
  metricValue: BenchmarkingWaterCourses['methods'][number] | undefined;
  metricFilterOptions: BenchmarkingWaterCourses['methods'];
  onMetricValueChange: (
    metricValue: BenchmarkingWaterCourses['methods'][number]
  ) => void;
  timeFrameValue: typeof timeFrameOptions[number];
  timeFrameOptions: typeof timeFrameOptions;
  onTimeFrameValueChange: (
    timeFrameValue: typeof timeFrameOptions[number]
  ) => void;
  showFirstRuns: boolean;
  onShowFirstRunsChange: (showFirstRuns: boolean) => void;
};

export const BenchmarkingFilters = ({
  watercourseValue,
  watercourseFilterOptions,
  typeValue,
  typeFilterOptions,
  metricValue,
  metricFilterOptions,
  timeFrameValue,
  timeFrameOptions,
  showFirstRuns,
  onWatercourseValueChange,
  onTypeValueChange,
  onMetricValueChange,
  onTimeFrameValueChange,
  onShowFirstRunsChange,
}: Props) => (
  <Container>
    <Select
      theme="grey"
      title="Watercourse:"
      value={watercourseValue}
      disableTyping
      options={watercourseFilterOptions}
      onChange={onWatercourseValueChange}
      required
    />
    <BenchmarkingTypeSelect
      value={typeValue}
      filterOptions={typeFilterOptions}
      onChange={onTypeValueChange}
    />
    <Select
      required
      theme="grey"
      title="Metric:"
      value={metricValue}
      disableTyping
      options={metricFilterOptions}
      onChange={onMetricValueChange}
    />
    <Select
      theme="grey"
      title="Time frame:"
      value={timeFrameValue}
      disableTyping
      options={timeFrameOptions}
      onChange={onTimeFrameValueChange}
      required
    />
    <Switch
      data-testid="show-first-runs"
      checked={showFirstRuns}
      onChange={onShowFirstRunsChange}
      name="showFirstRuns"
      size="small"
    >
      Show first runs
    </Switch>
  </Container>
);
