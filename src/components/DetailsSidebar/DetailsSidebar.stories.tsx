import { Button, Flex } from '@cognite/cogs.js';
import { Meta, Story } from '@storybook/react';
import { ComponentProps, useState } from 'react';
import DetailsSidebar from './DetailsSidebar';

export default {
  component: DetailsSidebar,
  title: 'Components/Details Sidebar/Full Sidebar',
} as Meta;

const Template: Story<ComponentProps<typeof DetailsSidebar>> = (args) => (
  <Flex style={{ height: 'calc(100vh - 40px)' }}>
    <div style={{ flexGrow: 1 }}>Content goes here</div>
    <DetailsSidebar {...args} />
  </Flex>
);

const calculationMock: ComponentProps<typeof DetailsSidebar>['source'] = {
  type: 'calculation',
  color: '#CCC',
  name: 'Test Calculation',
  statistics: {
    loading: false,
    error: false,
    count: 1,
    min: 1,
    max: 1,
    mean: 1,
    median: 1,
    std: 1,
    q25: 1,
    q50: 1,
    q75: 1,
    skewness: 1,
    kurtosis: 1,
    histogram: [
      { rangeStart: 1, rangeEnd: 2, quantity: 100 },
      { rangeStart: 2, rangeEnd: 3, quantity: 80 },
      { rangeStart: 3, rangeEnd: 4, quantity: 90 },
      { rangeStart: 4, rangeEnd: 5, quantity: 10 },
      { rangeStart: 5, rangeEnd: 6, quantity: 1 },
      { rangeStart: 6, rangeEnd: 7, quantity: 20 },
    ],
    unit: '%',
  },
  metadata: {
    type: 'calculation',
    loading: false,
    error: false,
    name: 'Test Calculation',
    lastUpdatedTime: '12.01.2020',
    sourceId: '1234567',
  },
};

const timeSeriesMock: ComponentProps<typeof DetailsSidebar>['source'] = {
  type: 'timeseries',
  color: '#F00',
  name: 'Test Time Series',
  statistics: {
    loading: false,
    error: false,
    count: 1,
    min: 1,
    max: 1,
    mean: 1,
    median: 1,
    std: 1,
    q25: 1,
    q50: 1,
    q75: 1,
    skewness: 1,
    kurtosis: 1,
    histogram: [
      { rangeStart: 1, rangeEnd: 2, quantity: 100 },
      { rangeStart: 2, rangeEnd: 3, quantity: 80 },
      { rangeStart: 3, rangeEnd: 4, quantity: 90 },
      { rangeStart: 4, rangeEnd: 5, quantity: 10 },
      { rangeStart: 5, rangeEnd: 6, quantity: 1 },
      { rangeStart: 6, rangeEnd: 7, quantity: 20 },
    ],
    unit: '%',
  },
  metadata: {
    type: 'timeseries',
    error: false,
    loading: false,
    name: 'RO_ACID_PUMP_READY',
    description: '',
    externalId: 'houston.smb.MainProgram\\RO_ACID_PUMP_READY',
    lastUpdatedTime: 'Oct 7, 2020 17:04:31',
    isStep: false,
    sourceId: '170545621080978',
    equipmentTag: '',
    equipmentLink: undefined,
    datasetName: 'Timeseries',
    datasetLink:
      'https://fusion.cognite.com/fusion/data-sets/data-set/3678371557883348undefined',
  },
};

export const Interactive: Story = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] =
    useState<ComponentProps<typeof DetailsSidebar>['selectedPanel']>(
      'statistics'
    );
  return (
    <Flex style={{ height: 'calc(100vh - 40px)' }}>
      <div style={{ flexGrow: 1 }}>
        <Button onClick={() => setSidebarOpen(true)}>
          Click to Open Sidebar
        </Button>
      </div>
      {sidebarOpen && (
        <DetailsSidebar
          selectedPanel={selectedPanel}
          onChangeSelectedPanel={setSelectedPanel}
          visible={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          source={calculationMock}
        />
      )}
    </Flex>
  );
};

export const CalculationStatistics = Template.bind({});

CalculationStatistics.args = {
  selectedPanel: 'statistics',
  visible: true,
  source: calculationMock,
};

export const CalculationStatisticsLoading = Template.bind({});

CalculationStatisticsLoading.args = {
  selectedPanel: 'statistics',
  visible: true,
  source: {
    ...calculationMock,
    statistics: { ...calculationMock.statistics, loading: true },
  },
};

export const CalculationStatisticsError = Template.bind({});

CalculationStatisticsError.args = {
  selectedPanel: 'statistics',
  visible: true,
  source: {
    ...calculationMock,
    statistics: {
      loading: false,
      count: NaN,
      min: NaN,
      max: NaN,
      median: NaN,
      mean: NaN,
      std: NaN,
      q25: NaN,
      q50: NaN,
      q75: NaN,
      skewness: NaN,
      kurtosis: NaN,
      histogram: [],
      unit: undefined,
      error: 'Something went wrong',
    },
  },
};

export const CalculationMetadata = Template.bind({});

CalculationMetadata.args = {
  visible: true,
  selectedPanel: 'metadata',
  source: calculationMock,
};

export const CalculationMetadataLoading = Template.bind({});

CalculationMetadataLoading.args = {
  visible: true,
  selectedPanel: 'metadata',
  source: {
    ...calculationMock,
    metadata: { ...calculationMock.metadata, loading: true },
  },
};

export const CalculationMetadataError = Template.bind({});

CalculationMetadataError.args = {
  visible: true,
  selectedPanel: 'metadata',
  source: {
    ...calculationMock,
    metadata: {
      type: 'calculation',
      name: undefined,
      sourceId: undefined,
      lastUpdatedTime: undefined,
      loading: false,
      error: 'Something went wrong!',
    },
  },
};

export const TimeSeriesStatistics = Template.bind({});

TimeSeriesStatistics.args = {
  selectedPanel: 'statistics',
  visible: true,
  source: timeSeriesMock,
};

export const TimeSeriesMetadata = Template.bind({});

TimeSeriesMetadata.args = {
  visible: true,
  selectedPanel: 'metadata',
  source: timeSeriesMock,
};

export const TimeSeriesMetadataLoading = Template.bind({});

TimeSeriesMetadataLoading.args = {
  visible: true,
  selectedPanel: 'metadata',
  source: {
    ...timeSeriesMock,
    metadata: { ...timeSeriesMock.metadata, loading: true },
  },
};

export const TimeSeriesMetadataError = Template.bind({});

TimeSeriesMetadataError.args = {
  visible: true,
  selectedPanel: 'metadata',
  source: {
    ...timeSeriesMock,
    metadata: {
      type: 'timeseries',
      name: undefined,
      sourceId: undefined,
      lastUpdatedTime: undefined,
      loading: false,
      error: 'Something went wrong!',
    },
  },
};
