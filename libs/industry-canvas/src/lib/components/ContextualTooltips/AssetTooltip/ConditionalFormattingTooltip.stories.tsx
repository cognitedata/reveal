import { Story } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CogniteClient } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import ConditionalFormattingTooltip from './ConditionalFormattingTooltip';
import ConditionalLiveSensorValue from './ConditionalLiveSensorValue';
import { RuleColor } from './constants';
import mockData from './mock/data';
import { Condition } from './types';

export default {
  title: 'Components/Asset Tooltip Story',
  component: ConditionalFormattingTooltip,
};

const generateMockSdk = () => {
  return {
    timeseries: {
      retrieve: async () => mockData.timeseries.retrieve,
    },
    datapoints: {
      retrieve: async () => mockData.datapoints.retrieve,
      retrieveLatest: async () => mockData.datapoints.retrieveLatest,
    },
    post: async (url: string): Promise<any> => {
      if (url.endsWith('timeseries/data/aggregate/single')) {
        return mockData.datapoints.aggregate.single;
      }

      throw new Error('Unmocked SDK Post call');
    },
  } as unknown as CogniteClient;
};

const queryClient = new QueryClient();

export const ConditionalFormattingTooltipStory: Story<{
  timeseriesList: number;
}> = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={generateMockSdk()}>
        <ConditionalFormattingTooltip
          id={7990758739061}
          onBackClick={() => console.log('onBackClick')}
          onSaveClick={(...rules) => console.log('onSaveClick', rules)}
          initialRules={[
            {
              id: '123',
              then: RuleColor.GREEN,
              condition: Condition.LESS_THAN,
              comparisonValue: 0.5,
            },
            {
              id: '456',
              then: RuleColor.RED,
              condition: Condition.GREATER_THAN_OR_EQUAL,
              comparisonValue: 0.5,
            },
          ]}
        />
      </SDKProvider>
    </QueryClientProvider>
  );
};

ConditionalFormattingTooltipStory.args = {};

export const LiveSensorValueStory: Story = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
      }}
    >
      <ConditionalLiveSensorValue value={1} unit="N" rules={[]} />
      <ConditionalLiveSensorValue value={1} rules={[]} />
      <ConditionalLiveSensorValue
        value={12345678910}
        unit="Newtonian Swetonians"
        rules={[]}
      />
      <ConditionalLiveSensorValue value={Number.NaN} rules={[]} />
      <ConditionalLiveSensorValue value={12345678910} rules={[]} />
      <ConditionalLiveSensorValue value="True" unit="Boolean" rules={[]} />
      <ConditionalLiveSensorValue
        value="Some very long text value"
        rules={[]}
      />
      <ConditionalLiveSensorValue
        value={0.100000012345679}
        unit="Newtonian Swetonians"
        rules={[]}
      />
      <ConditionalLiveSensorValue value={0.100000012345679} rules={[]} />
    </div>
  );
};

LiveSensorValueStory.args = {};
