import { Meta, Story } from '@storybook/react';
import { ReactFlowProvider } from 'react-flow-renderer';
import { fullListOfOperations } from 'models/calculation-backend/operations/mocks';
import { ComponentProps } from 'react';
import ReactFlowNodeEditorContainer from './ReactFlowNodeEditorContainer';
import { defaultTranslations } from '../translations';

export default {
  component: ReactFlowNodeEditorContainer,
  title: 'Components/Node Editor (Container)/v2',
} as Meta;

const Template: Story<ComponentProps<typeof ReactFlowNodeEditorContainer>> = (
  args
) => {
  return (
    <div style={{ width: 'calc(100vw - 30px)', height: 'calc(100vh - 30px)' }}>
      <ReactFlowProvider>
        <ReactFlowNodeEditorContainer {...args} />
      </ReactFlowProvider>
    </div>
  );
};

export const EmptyCalculation = Template.bind({});

EmptyCalculation.args = {
  workflow: {
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
