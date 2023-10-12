import { ComponentProps } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';

import { Meta, Story } from '@storybook/react';

import { fullListOfOperations } from '../../../models/operations/mocks';
import { defaultTranslations } from '../translations';

import ReactFlowNodeEditorContainer from './ReactFlowNodeEditorContainer';

export default {
  component: ReactFlowNodeEditorContainer,
  title: 'Components/Node Editor (Container)/v2',
} as Meta;

const Template: Story<ComponentProps<typeof ReactFlowNodeEditorContainer>> = (
  args
) => {
  return (
    <div style={{ width: 'calc(100vw - 30px)', height: 'calc(100vh - 30px)' }}>
      {/* 
    todo(DEGR-2397) react 18 has FC without children
    eslint-disable-next-line
    @ts-ignore*/}
      <ReactFlowProvider>
        <ReactFlowNodeEditorContainer {...args} />
      </ReactFlowProvider>
    </div>
  );
};

export const EmptyCalculation = Template.bind({});

EmptyCalculation.args = {
  source: {
    id: 'uZZ2AvDqqhsSe-RjPUS-0',
    name: 'Test Calculation',
    color: '#1192e8',
    enabled: true,
    flow: {
      zoom: 1,
      elements: [],
      position: [0, 0],
    },
    version: 'v2',
    settings: { autoAlign: false },
  },
  operations: fullListOfOperations,
  sources: [
    {
      label: 'Timeseries Source 1',
      color: 'red',
      value: 'ts-source-1',
      type: 'timeseries',
    },
    {
      label: 'Timeseries Source 2',
      color: 'green',
      value: 'ts-source-2',
      type: 'timeseries',
    },
    {
      label: 'Calculation Source 1',
      color: 'magenta',
      value: 'calc-source-1',
      type: 'workflow',
    },
    {
      label: 'Calculation Source 2',
      color: 'orange',
      value: 'calc-source-2',
      type: 'workflow',
    },
  ],
  translations: defaultTranslations,
};
