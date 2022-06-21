import { DocumentIcon, Icon } from '@cognite/cogs.js';
import { Meta, Story } from '@storybook/react';
import React from 'react';
import FileListSidebar from './FileListSidebar';
import preview from './preview.mock.png';

type Props = React.ComponentProps<typeof FileListSidebar>;

export default {
  component: FileListSidebar,
  title: 'Components/File View Page/File List Sidebar',
  argTypes: {
    onFileClick: { action: 'Clicked on the file' },
    onClose: { action: 'Clicked to close the sidebar' },
  },
} as Meta;

const Template: Story<Props> = (args) => <FileListSidebar {...args} />;

export const Default = Template.bind({});

Default.args = {
  asset: {
    name: 'Very Long asset name',
    description:
      'This asset has a big name by purpose so we can test how long the UI can tolerate',
  },
  files: {
    list: Array(4)
      .fill(1)
      .map((_el, index) => ({
        id: index,
        name: 'Test_file_name.pdf',
        active: index === 2,
        error: false,
        preview: <img src={preview} alt="PDF Preview" />,
      })),
    isLoading: false,
    isError: false,
  },
};

export const ListLoading = Template.bind({});

ListLoading.args = {
  asset: Default.args.asset,
  files: { list: [], isLoading: true, isError: false },
};

export const PreviewLoading = Template.bind({});

PreviewLoading.args = {
  asset: Default.args.asset,
  files: {
    list: Array(4)
      .fill(1)
      .map((_el, index) => ({
        id: index,
        name: 'Test_file_name.pdf',
        active: index === 2,
        error: false,
        preview: <Icon type="Loader" />,
      })),
    isLoading: false,
    isError: false,
  },
};

export const PreviewNotPossible = Template.bind({});

PreviewNotPossible.args = {
  asset: Default.args.asset,
  files: {
    list: Array(4)
      .fill(1)
      .map((_el, index) => ({
        id: index,
        name: 'Test_file_name.pdf',
        active: index === 2,
        error: false,
        preview:
          index % 2 === 0 ? (
            <img src={preview} alt="PDF Preview" />
          ) : (
            <DocumentIcon file="pdf" style={{ height: 36, width: 36 }} />
          ),
      })),
    isLoading: false,
    isError: false,
  },
};

export const EmptyList = Template.bind({});

EmptyList.args = {
  asset: Default.args.asset,
  files: { list: [], isLoading: false, isError: false },
};

export const Error = Template.bind({});

Error.args = {
  asset: Default.args.asset,
  files: { list: [], isLoading: false, isError: true },
};
