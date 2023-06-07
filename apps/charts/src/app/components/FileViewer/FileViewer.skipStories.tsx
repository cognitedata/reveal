import React from 'react';

import { FileViewer } from '@charts-app/components/FileViewer/FileViewer';
import { files } from '@charts-app/stubs/files';
import { Meta, Story } from '@storybook/react';

import { CogniteClient, FileInfo as File } from '@cognite/sdk';

// @ts-ignore
import pdfFileUrl from './pdf/example.pdf';
import dataExplorationDecorator from './utils/dataExplorationDecorator';

const pdfSdkMock = {
  files: {
    getDownloadUrls: async () => [{ downloadUrl: pdfFileUrl }],
  },
} as unknown as CogniteClient;

type Props = React.ComponentProps<typeof FileViewer>;

export default {
  component: FileViewer,
  title: 'Components/FileViewer',
  parameters: {
    explorerConfig: { sdkMockOverride: pdfSdkMock },
  },
  decorators: [dataExplorationDecorator],
} as Meta;

const Template: Story<Props> = (args) => <FileViewer {...args} />;

export const NoFileSelected = Template.bind({});

NoFileSelected.args = {
  file: undefined,
};

export const NotPreviewableFile = Template.bind({});

NotPreviewableFile.args = {
  file: { id: 456 } as File,
};

export const ViewFile = Template.bind({});

ViewFile.args = {
  file: files[0],
};
