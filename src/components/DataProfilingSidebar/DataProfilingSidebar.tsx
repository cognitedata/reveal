/**
 * Data Profiling Sidebar
 */

import styled from 'styled-components/macro';
import { FunctionComponent, useState, useMemo } from 'react';
import { Icon, Tooltip, Button, Infobox } from '@cognite/cogs.js';
import { Chart, ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import { makeDefaultTranslations } from 'utils/translations';
import { StatusStatusEnum } from '@cognite/calculation-backend';
import {
  Sidebar,
  TopContainer,
  TopContainerTitle,
  TopContainerAside,
  ContentOverflowWrapper,
  ContentContainer,
  SidebarFormLabel,
  SourceSelect,
  // ReverseSwitch
} from 'components/Common/SidebarElements';
import Metrics from './Metrics';
import Histogram from './Histogram';
import { useDataProfiling } from './hooks';

type Props = {
  visible: boolean;
  onClose: () => void;
  chart: Chart;
  // updateChart: (update: (c: Chart | undefined) => Chart) => void;
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
  'Metric distribution',
  'Density',
  'Timedelta',
  'Gaps',
  'Time Delta',
  'No histogram data available',
  'The number of data points in the selected source exceeds the 100000 limit.',
  'The selected source is empty.',
  'Time in milliseconds'
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
      return <Icon type="ExclamationMark" title="Failed" />;
    default:
      return null;
  }
};

const DataProfilingSidebar: FunctionComponent<Props> = ({
  visible,
  onClose,
  chart,
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
      .filter(Boolean) as (ChartTimeSeries | ChartWorkflow)[];
  }, [
    chart.sourceCollection,
    chart.timeSeriesCollection,
    chart.workflowCollection,
  ]);

  const sourceOptions: (ChartTimeSeries | ChartWorkflow)[] = sources.map(
    (item) => ({
      value: item.id,
      label: item.name,
      ...item,
    })
  );

  const distributionOptions: DistributionOptionType[] = [
    {
      value: 'density',
      label: t.Density,
    },
    {
      value: 'timedelta',
      label: t.Timedelta,
    },
  ];

  const [selectedSource, setSelectedSource] = useState<
    null | ChartTimeSeries | ChartWorkflow
  >(null);
  const [selectedDistribution, setselectedDistribution] =
    useState<DistributionOptionType>(distributionOptions[0]);
  // const [showGaps, setShowGaps] = useState<boolean>(false);

  let selectedSourceIcon;
  if (selectedSource) {
    selectedSourceIcon =
      selectedSource.type === 'timeseries' ? 'Timeseries' : 'Function';
  } else {
    selectedSourceIcon = '';
  }

  const onSelectSource = (source: ChartTimeSeries | ChartWorkflow) => {
    setSelectedSource(source);
  };

  const onSelectDistribution = (distribution: DistributionOptionType) => {
    setselectedDistribution(distribution);
  };

  // const onSwitchToggle = () => setShowGaps(prev => !prev);

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

  const parseValue = (
    value: number | null | undefined,
    unit: string | null = null
  ): string | number => {
    if (value === null || value === undefined) {
      return '-';
    }
    return unit ? `${value}${unit}` : value;
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
          <SidebarFormLabel>
            <b>{t.Source}</b>
          </SidebarFormLabel>
          <SourceSelect
            icon={selectedSourceIcon}
            options={sourceOptions}
            iconBg={selectedSource?.color || '#ccc'}
            onChange={(source: ChartTimeSeries | ChartWorkflow) =>
              onSelectSource(source)
            }
            value={{
              value: selectedSource?.id || 'not-selected',
              label: selectedSource?.name || t['Please select'],
            }}
          />

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
                </Infobox>
              </BlockSpacer>
            </>
          )}

          {selectedSource && !dataProfilingError && (
            <>
              {/* Details block to display the profiling data */}
              <BlockSpacer>
                <Metrics
                  title={t.Gaps}
                  dataSource={[
                    {
                      label: t['Number of gaps'],
                      value: parseValue(dataProfilingResults?.gaps_num),
                      tooltip:
                        t[
                          'If time between two data points is more than 1.5 multiple of the inter quatile range (IQR) of all time deltas it is defined as a gap'
                        ],
                    },
                    {
                      label: t['Avg. gap length'],
                      value: parseValue(dataProfilingResults?.gaps_avg, 'ms'),
                      tooltip: t['Length of average gap'],
                    },
                    {
                      label: t['Max. gap length'],
                      value: parseValue(dataProfilingResults?.gaps_max, 'ms'),
                      tooltip: t['Length of largest gap'],
                    },
                  ]}
                />
              </BlockSpacer>

              <BlockSpacer>
                <Metrics
                  title={t['Time Delta']}
                  dataSource={[
                    {
                      label: t['Time delta median'],
                      value: parseValue(
                        dataProfilingResults?.median_time_frequency,
                        'ms'
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
                        'ms'
                      ),
                      tooltip:
                        t[
                          'Spread measured by using the median absolute deviation (MAD) of time deltas (time difference between two consecutive points)'
                        ],
                    },
                  ]}
                />
              </BlockSpacer>

              {/* Metric distribution selector */}
              <SidebarFormLabel>
                <b>{t['Metric distribution']}</b>
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

              {/* Boxplot and Histogram */}
              {/* <BlockSpacer>
                                <Boxplot />
                                <DataProfilingHistogram />
                            </BlockSpacer> */}
              {/* <BlockSpacer>
                                <div
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'var(--cogs-greyscale-grey1)'
                                    }}>
                                    <p style={{ margin: '0px' }}><b>{selectedDistribution.label} boxplot</b></p>
                                </div>
                            </BlockSpacer> */}

              <BlockSpacer>
                <Histogram
                  noDataText={t['No histogram data available']}
                  unitLabel={
                    selectedDistribution.value === 'timedelta'
                      ? t['Time in milliseconds']
                      : ''
                  }
                  data={
                    selectedDistribution.value === 'density'
                      ? dataProfilingResults?.density_histogram
                      : dataProfilingResults?.timedelta_histogram
                  }
                />
              </BlockSpacer>

              {/* Sidebar switch */}
              {/* <BlockSpacer>
                                <ReverseSwitch
                                    name="show-gaps"
                                    checked={showGaps}
                                    onChange={() => onSwitchToggle()}
                                >
                                    <b>Show gaps</b>
                                </ReverseSwitch>
                            </BlockSpacer> */}
            </>
          )}
        </ContentContainer>
      </ContentOverflowWrapper>
    </Sidebar>
  );
};

export default DataProfilingSidebar;
