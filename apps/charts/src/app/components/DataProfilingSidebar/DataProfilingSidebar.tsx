/**
 * Data Profiling Sidebar
 */

import { FunctionComponent, useState, useMemo } from 'react';

import {
  Sidebar,
  TopContainer,
  TopContainerTitle,
  TopContainerAside,
  ContentOverflowWrapper,
  ContentContainer,
  SidebarFormLabel,
  SourceSelect,
} from '@charts-app/components/Common/SidebarElements';
import { Chart, ChartSource } from '@charts-app/models/chart/types';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import styled from 'styled-components/macro';

import { StatusStatusEnum } from '@cognite/calculation-backend';
import { Icon, Tooltip, Button, Infobox } from '@cognite/cogs.js';

import { SourceSelector } from '../Common/SourceSelector';

import Boxplot from './Boxplot';
import Calculations from './Calculations';
import { convertMillisecondsToSeconds } from './helpers';
import Histogram from './Histogram';
import { useDataProfiling } from './hooks';
import Metrics from './Metrics';

type Props = {
  visible: boolean;
  onClose: () => void;
  chart: Chart;
  updateChart: (update: (c: Chart | undefined) => Chart) => void;
};

const defaultTranslations = makeDefaultTranslations(
  'Data Profiling',
  'Hide',
  'Source',
  'Please select',
  'Number of gaps',
  'If time between two data points is more than 1.5 multiple of the inter quatile range (IQR) of all time deltas it is defined as a gap',
  'Avg. gap length',
  'Length of average gap',
  'Max. gap length',
  'Length of largest gap',
  'Time delta spread',
  'Spread measured by using the median absolute deviation (MAD) of time deltas (time difference between two consecutive points)',
  'Time delta median',
  'Median of the time deltas (time difference between two consecutive points)',
  'Metric Distribution',
  'Density',
  'Timedelta',
  'Gaps',
  'Time Delta',
  'No histogram data available',
  'The number of data points in the selected source exceeds the 100000 limit.',
  'The selected source is empty.',
  'Time in seconds',
  'No boxplot data available',
  'The time delta histogram shows the distribution of time deltas. The y-axis gives the number of time deltas, and the x-axis gives the time delta value.',
  'The density histogram shows the distribution of density. Density is calculated as follows: for each data point a time frame of 5 minutes is defined, and the number of data points in that time window gives the density. The y-axis gives the number of data points, and the x-axis gives the density value.',
  'The selected source has less than two data points.',
  'Data Points',
  'Number of data points',
  'Number of data points in the selected source'
);

type DistributionOptionType = {
  value: string;
  label: string;
};

const BlockSpacer = styled.div`
  margin-top: 16px;
`;

const renderStatusIcon = (status?: StatusStatusEnum) => {
  switch (status) {
    case StatusStatusEnum.Pending:
    case StatusStatusEnum.Running:
      return <Icon type="Loader" />;
    case StatusStatusEnum.Success:
      return <Icon type="Checkmark" />;
    case StatusStatusEnum.Failed:
    case StatusStatusEnum.Error:
      return (
        <Tooltip content="Failed">
          <Icon type="ExclamationMark" />
        </Tooltip>
      );
    default:
      return null;
  }
};

const DataProfilingSidebar: FunctionComponent<Props> = ({
  visible,
  onClose,
  chart,
  updateChart,
}: Props) => {
  const t = {
    ...defaultTranslations,
  };

  const sources = useMemo(() => {
    return (chart.sourceCollection ?? [])
      .map((x) => ({
        ...x,
        ...(x.type === 'timeseries'
          ? {
              type: 'timeseries',
              ...chart?.timeSeriesCollection?.find((ts) => ts.id === x.id),
            }
          : {
              type: 'workflow',
              ...chart?.workflowCollection?.find((flow) => flow.id === x.id),
            }),
      }))
      .filter(Boolean) as ChartSource[];
  }, [
    chart.sourceCollection,
    chart.timeSeriesCollection,
    chart.workflowCollection,
  ]);

  const distributionOptions: DistributionOptionType[] = [
    {
      value: 'timedelta',
      label: t.Timedelta,
    },
    {
      value: 'density',
      label: t.Density,
    },
  ];

  const [selectedSource, setSelectedSource] = useState<
    ChartSource | undefined
  >();
  const [selectedDistribution, setselectedDistribution] =
    useState<DistributionOptionType>(distributionOptions[0]);

  const onSelectDistribution = (distribution: DistributionOptionType) => {
    setselectedDistribution(distribution);
  };

  const {
    results: dataProfilingResults,
    status: dataProfilingStatus,
    error: dataProfilingError,
  } = useDataProfiling(
    sources.find((s) => s.id === selectedSource?.id),
    chart?.dateFrom || new Date().toISOString(),
    chart?.dateTo || new Date().toISOString(),
    visible
  );

  const numberOfDataPoints = dataProfilingResults?.timedelta_histogram
    ? 1 +
      dataProfilingResults.timedelta_histogram.reduce(
        (accumulator, item) => accumulator + item.quantity,
        0
      )
    : 0;

  const parseValue = (
    value: number | null | undefined,
    callback: null | ((num: number) => number | string)
  ): string | number => {
    if (value === null || value === undefined) {
      return '-';
    }
    return (callback && callback(value)) || value;
  };

  return (
    <Sidebar visible={visible}>
      <TopContainer>
        {/* Sidebar header */}
        <TopContainerTitle>
          <Icon type="Profiling" size={21} />
          {t['Data Profiling']}
        </TopContainerTitle>

        {/* Sidebar tooltip */}
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
          {/* Source selector */}
          <SidebarFormLabel $first>
            <b>{t.Source}</b>
          </SidebarFormLabel>
          <SourceSelector onChange={setSelectedSource} value={selectedSource} />

          {/* Show data profiling loading status */}
          <BlockSpacer>
            <div>{renderStatusIcon(dataProfilingStatus)}</div>
          </BlockSpacer>

          {/* Show data profiling response errors */}
          {dataProfilingError && (
            <>
              <BlockSpacer>
                <Infobox type="warning" title="Warning">
                  {dataProfilingError.includes('exceeded') && (
                    <>
                      <p>
                        {
                          t[
                            'The number of data points in the selected source exceeds the 100000 limit.'
                          ]
                        }
                      </p>
                    </>
                  )}
                  {dataProfilingError.includes('empty') && (
                    <>
                      <p>{t['The selected source is empty.']}</p>
                    </>
                  )}
                  {dataProfilingError.includes('less than two') && (
                    <>
                      <p>
                        {
                          t[
                            'The selected source has less than two data points.'
                          ]
                        }
                      </p>
                    </>
                  )}
                </Infobox>
              </BlockSpacer>
            </>
          )}

          {selectedSource && !dataProfilingError && (
            <>
              {/* Details block to display the profiling data */}
              <BlockSpacer>
                <SidebarFormLabel>
                  <b>{t.Gaps}</b>
                </SidebarFormLabel>
                <Metrics
                  dataSource={[
                    {
                      label: t['Number of gaps'],
                      value: parseValue(dataProfilingResults?.gaps_num, null),
                      tooltip:
                        t[
                          'If time between two data points is more than 1.5 multiple of the inter quatile range (IQR) of all time deltas it is defined as a gap'
                        ],
                    },
                    {
                      label: t['Avg. gap length'],
                      value: parseValue(
                        dataProfilingResults?.gaps_avg,
                        convertMillisecondsToSeconds
                      ),
                      tooltip: t['Length of average gap'],
                    },
                    {
                      label: t['Max. gap length'],
                      value: parseValue(
                        dataProfilingResults?.gaps_max,
                        convertMillisecondsToSeconds
                      ),
                      tooltip: t['Length of largest gap'],
                    },
                  ]}
                />

                {/* Sidebar Calculations */}
                {dataProfilingResults && !!dataProfilingResults?.gaps_num && (
                  <BlockSpacer>
                    <Calculations
                      chart={chart}
                      updateChart={updateChart}
                      source={selectedSource}
                    />
                  </BlockSpacer>
                )}
              </BlockSpacer>

              <BlockSpacer>
                <SidebarFormLabel>
                  <b>{t['Time Delta']}</b>
                </SidebarFormLabel>
                <Metrics
                  dataSource={[
                    {
                      label: t['Time delta median'],
                      value: parseValue(
                        dataProfilingResults?.median_time_frequency,
                        convertMillisecondsToSeconds
                      ),
                      tooltip:
                        t[
                          'Median of the time deltas (time difference between two consecutive points)'
                        ],
                    },
                    {
                      label: t['Time delta spread'],
                      value: parseValue(
                        dataProfilingResults?.mad_time_frequency,
                        convertMillisecondsToSeconds
                      ),
                      tooltip:
                        t[
                          'Spread measured by using the median absolute deviation (MAD) of time deltas (time difference between two consecutive points)'
                        ],
                    },
                  ]}
                />
              </BlockSpacer>

              <BlockSpacer>
                <SidebarFormLabel>
                  <b>{t['Data Points']}</b>
                </SidebarFormLabel>
                <Metrics
                  dataSource={[
                    {
                      label: t['Number of data points'],
                      value: numberOfDataPoints,
                      tooltip:
                        t['Number of data points in the selected source'],
                    },
                  ]}
                />
              </BlockSpacer>

              {/* Metric distribution selector */}
              <BlockSpacer>
                <SidebarFormLabel>
                  <b>{t['Metric Distribution']}</b>
                </SidebarFormLabel>
                <SourceSelect
                  options={distributionOptions}
                  onChange={(distribution: DistributionOptionType) =>
                    onSelectDistribution(distribution)
                  }
                  value={{
                    value: selectedDistribution.value,
                    label: selectedDistribution.label,
                  }}
                />
              </BlockSpacer>

              {/* Boxplot */}
              <BlockSpacer>
                <Boxplot
                  noDataText={t['No boxplot data available']}
                  boxplotType={
                    selectedDistribution.value === 'timedelta'
                      ? 'timedelta'
                      : 'density'
                  }
                  data={
                    selectedDistribution.value === 'density'
                      ? dataProfilingResults?.density_boxplot
                      : dataProfilingResults?.timedelta_boxplot
                  }
                />
              </BlockSpacer>

              {/* Density and timedelta histograms */}
              <BlockSpacer>
                <Histogram
                  noDataText={t['No histogram data available']}
                  histogramType={
                    selectedDistribution.value === 'timedelta'
                      ? 'timedelta'
                      : 'density'
                  }
                  unitLabel={
                    selectedDistribution.value === 'timedelta'
                      ? t['Time in seconds']
                      : t.Density
                  }
                  data={
                    selectedDistribution.value === 'density'
                      ? dataProfilingResults?.density_histogram
                      : dataProfilingResults?.timedelta_histogram
                  }
                />
              </BlockSpacer>

              {/* Histogram description */}
              {(dataProfilingResults?.density_histogram ||
                dataProfilingResults?.timedelta_histogram) && (
                <BlockSpacer>
                  <Infobox showIcon={false}>
                    {selectedDistribution.value === 'timedelta'
                      ? t[
                          'The time delta histogram shows the distribution of time deltas. The y-axis gives the number of time deltas, and the x-axis gives the time delta value.'
                        ]
                      : t[
                          'The density histogram shows the distribution of density. Density is calculated as follows: for each data point a time frame of 5 minutes is defined, and the number of data points in that time window gives the density. The y-axis gives the number of data points, and the x-axis gives the density value.'
                        ]}
                  </Infobox>
                </BlockSpacer>
              )}
            </>
          )}
        </ContentContainer>
      </ContentOverflowWrapper>
    </Sidebar>
  );
};

export default DataProfilingSidebar;
