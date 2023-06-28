import React from 'react';

import { expect } from '@storybook/jest';
import { Meta, Story } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/testing-library';

import { DocumentIcon, Icon } from '@cognite/cogs.js';

import { FileList } from './FileList';
import preview from './preview.mock.png';

type Props = React.ComponentProps<typeof FileList>;

export default {
  component: FileList,
  title: 'Components/File View Page/File List',
  argTypes: {
    onFileClick: { action: 'Clicked on the file' },
  },
} as Meta;

const Template: Story<Props> = (args) => <FileList {...args} />;

export const Default = Template.bind({});

Default.args = {
  files: Array(4)
    .fill(1)
    .map((_el, index) => ({
      id: index,
      name: `Test_file_name_${index}.pdf`,
      active: index === 2,
      error: false,
      preview: <img src={preview} alt="PDF Preview" />,
    })),
};

Default.play = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByText('Test_file_name_0.pdf'));
  await waitFor(() => expect(args.onFileClick).toHaveBeenCalled());
};

export const ListLoading = Template.bind({});

ListLoading.args = {
  files: [],
  isLoading: true,
};

export const PreviewLoading = Template.bind({});

PreviewLoading.args = {
  files: Array(4)
    .fill(1)
    .map((_el, index) => ({
      id: index,
      name: 'Test_file_name.pdf',
      active: index === 2,
      error: false,
      preview: <Icon type="Loader" />,
    })),
};

export const PreviewNotPossible = Template.bind({});

PreviewNotPossible.args = {
  files: Array(4)
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
};

export const EmptyList = Template.bind({});

EmptyList.args = {
  files: [],
  isLoading: false,
};

export const Error = Template.bind({});

Error.args = {
  ...EmptyList.args,
  isError: true,
};
