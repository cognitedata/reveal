import { DocumentIcon, Icon } from '@cognite/cogs.js';
import { Meta, Story } from '@storybook/react';
import React from 'react';
import { FileListItem } from './FileListItem';
import preview from './preview.mock.png';

type Props = React.ComponentProps<typeof FileListItem>;

export default {
  component: FileListItem,
  title: 'Components/File View Page/File List Item',
  argTypes: {
    onFileClick: { action: 'Clicked on the file' },
  },
} as Meta;

const Template: Story<Props> = (args) => <FileListItem {...args} />;

export const Default = Template.bind({});

Default.args = {
  fileName: 'Test_file_name.pdf',
  preview: <img src={preview} alt="PDF Preview" />,
  isActive: true,
  isError: false,
};

export const PreviewLoading = Template.bind({});

PreviewLoading.args = {
  ...Default.args,
  preview: <Icon type="Loader" />,
  isActive: false,
};

export const PreviewNotPossible = Template.bind({});

PreviewNotPossible.args = {
  ...Default.args,
  preview: <DocumentIcon file="pdf" style={{ height: 36, width: 36 }} />,
};

export const Error = Template.bind({});

Error.args = {
  ...Default.args,
  preview: <></>,
  isActive: false,
  isError: true,
};

export const UndefinedTest = Template.bind({});

UndefinedTest.args = {
  ...Default.args,
  preview: <></>,
  isActive: undefined,
  isError: undefined,
};
