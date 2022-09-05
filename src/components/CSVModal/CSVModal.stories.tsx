import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { CogniteClient } from '@cognite/sdk';
import { CSVModal } from './CSVModal';
import { CSVModalContext, CSVModalContextInterface } from './CSVModalContext';

export default {
  component: CSVModal,
  title: 'Components/CSV Modal',
  decorators: [
    (story, { parameters }) => {
      return (
        <CSVModalContext.Provider value={parameters.hooks}>
          {story()}
        </CSVModalContext.Provider>
      );
    },
  ],
} as Meta;

const Template: Story<ComponentProps<typeof CSVModal>> = (args) => (
  <CSVModal {...args} />
);

export const NoSources = Template.bind({});

NoSources.args = {
  isOpen: true,
  dateFrom: new Date(),
  dateTo: new Date(),
  onDateChange: () => {},
  onClose: () => {},
};

NoSources.parameters = {
  hooks: {
    useChartAtom() {
      return [
        {
          id: 'abc-123',
          version: 2,
          name: 'Test chart',
          timeSeriesCollection: [],
          workflowCollection: [],
          dateFrom: new Date().toJSON(),
          dateTo: new Date().toJSON(),
          user: 'owner-id',
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        },
        () => {},
      ];
    },
    useExportToCSV() {
      return {
        onExport: () => {},
        isDoneExporting: false,
        isExporting: false,
        error: undefined,
      };
    },
    useSDK() {
      return {} as CogniteClient;
    },
  } as CSVModalContextInterface,
};

export const SingleTimeseries = Template.bind({});

SingleTimeseries.args = {
  isOpen: true,
  dateFrom: new Date(),
  dateTo: new Date(),
  onDateChange: () => {},
  onClose: () => {},
};

SingleTimeseries.parameters = {
  hooks: {
    useChartAtom() {
      return [
        {
          id: 'abc-123',
          version: 2,
          name: 'Test chart',
          timeSeriesCollection: [
            {
              id: 'ts-123',
              tsId: 123,
              name: 'TS 1',
              color: 'red',
              createdAt: new Date().getTime(),
              enabled: true,
            },
          ],
          workflowCollection: [],
          dateFrom: new Date().toJSON(),
          dateTo: new Date().toJSON(),
          user: 'owner-id',
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        },
        () => {},
      ];
    },
    useExportToCSV() {
      return {
        onExport: () => {},
        isDoneExporting: false,
        isExporting: false,
        error: undefined,
      };
    },
    useSDK() {
      return {} as CogniteClient;
    },
  } as CSVModalContextInterface,
};

export const SingleCalculation = Template.bind({});

SingleCalculation.args = {
  isOpen: true,
  dateFrom: new Date(),
  dateTo: new Date(),
  onDateChange: () => {},
  onClose: () => {},
};

SingleCalculation.parameters = {
  hooks: {
    useChartAtom() {
      return [
        {
          id: 'abc-123',
          version: 2,
          name: 'Test chart',
          timeSeriesCollection: [],
          workflowCollection: [
            {
              version: 'v2',
              id: 'calc-123',
              name: 'Calc 1',
              color: 'red',
              createdAt: new Date().getTime(),
              enabled: true,
              settings: {
                autoAlign: true,
              },
            },
          ],
          dateFrom: new Date().toJSON(),
          dateTo: new Date().toJSON(),
          user: 'owner-id',
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        },
        () => {},
      ];
    },
    useExportToCSV() {
      return {
        onExport: () => {},
        isDoneExporting: false,
        isExporting: false,
        error: undefined,
      };
    },
    useSDK() {
      return {} as CogniteClient;
    },
  } as CSVModalContextInterface,
};

export const IsExporting = Template.bind({});

IsExporting.args = {
  isOpen: true,
  dateFrom: new Date(),
  dateTo: new Date(),
  onDateChange: () => {},
  onClose: () => {},
};

IsExporting.parameters = {
  hooks: {
    useChartAtom() {
      return [
        {
          id: 'abc-123',
          version: 2,
          name: 'Test chart',
          timeSeriesCollection: [],
          workflowCollection: [
            {
              version: 'v2',
              id: 'calc-123',
              name: 'Calc 1',
              color: 'red',
              createdAt: new Date().getTime(),
              enabled: true,
              settings: {
                autoAlign: true,
              },
            },
          ],
          dateFrom: new Date().toJSON(),
          dateTo: new Date().toJSON(),
          user: 'owner-id',
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        },
        () => {},
      ];
    },
    useExportToCSV() {
      return {
        onExport: () => {},
        isDoneExporting: false,
        isExporting: true,
        error: undefined,
      };
    },
    useSDK() {
      return {} as CogniteClient;
    },
  } as CSVModalContextInterface,
};

export const IsDoneExporting = Template.bind({});

IsDoneExporting.args = {
  isOpen: true,
  dateFrom: new Date(),
  dateTo: new Date(),
  onDateChange: () => {},
  onClose: () => {},
};

IsDoneExporting.parameters = {
  hooks: {
    useChartAtom() {
      return [
        {
          id: 'abc-123',
          version: 2,
          name: 'Test chart',
          timeSeriesCollection: [],
          workflowCollection: [
            {
              version: 'v2',
              id: 'calc-123',
              name: 'Calc 1',
              color: 'red',
              createdAt: new Date().getTime(),
              enabled: true,
              settings: {
                autoAlign: true,
              },
            },
          ],
          dateFrom: new Date().toJSON(),
          dateTo: new Date().toJSON(),
          user: 'owner-id',
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        },
        () => {},
      ];
    },
    useExportToCSV() {
      return {
        onExport: () => {},
        isDoneExporting: true,
        isExporting: false,
        error: undefined,
      };
    },
    useSDK() {
      return {} as CogniteClient;
    },
  } as CSVModalContextInterface,
};

export const ExportFailed = Template.bind({});

ExportFailed.args = {
  isOpen: true,
  dateFrom: new Date(),
  dateTo: new Date(),
  onDateChange: () => {},
  onClose: () => {},
};

ExportFailed.parameters = {
  hooks: {
    useChartAtom() {
      return [
        {
          id: 'abc-123',
          version: 2,
          name: 'Test chart',
          timeSeriesCollection: [],
          workflowCollection: [
            {
              version: 'v2',
              id: 'calc-123',
              name: 'Calc 1',
              color: 'red',
              createdAt: new Date().getTime(),
              enabled: true,
              settings: {
                autoAlign: true,
              },
            },
          ],
          dateFrom: new Date().toJSON(),
          dateTo: new Date().toJSON(),
          user: 'owner-id',
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        },
        () => {},
      ];
    },
    useExportToCSV() {
      return {
        onExport: () => {},
        isDoneExporting: false,
        isExporting: false,
        error: new Error('Something went wrong during the export'),
      };
    },
    useSDK() {
      return {} as CogniteClient;
    },
  } as CSVModalContextInterface,
};
