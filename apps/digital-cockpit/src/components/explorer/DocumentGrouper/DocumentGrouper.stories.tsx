import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { MockFiles } from '__mocks/files';

import DocumentRow from '../DocumentRow/DocumentRow';
import { DocumentRowWrapper } from '../DocumentRow/DocumentRowWrapper';

import DocumentGrouper, { DocumentGrouperProps } from './DocumentGrouper';

const meta: Meta<DocumentGrouperProps> = {
  title: 'Document / Document Grouper',
  component: DocumentGrouper,
  argTypes: {
    files: {
      name: 'files',
      defaultValue: MockFiles.multiple(6),
      control: {
        type: 'object',
      },
    },
    groupByField: {
      name: 'Grouped by field',
      description: 'Define what METADATA field we group them by',
      defaultValue: 'documentType',
    },
    nameMappings: {
      name: 'Name mappings',
      description: 'Mapping from a field name to another value',
      defaultValue: {
        PID: 'Process and Instrumentation diagram',
        SLD: 'Single line diagram',
        Uncategorized: 'Unknown',
      },
      control: {
        type: 'object',
      },
    },
  },
};

export default meta;

const Template: ExtendedStory<DocumentGrouperProps> = (args) => (
  <DocumentGrouper {...args}>
    {(files) => (
      <DocumentRowWrapper>
        {files.map((file) => (
          <DocumentRow key={file.id} document={file} />
        ))}
      </DocumentRowWrapper>
    )}
  </DocumentGrouper>
);

export const Standard = Template.bind({});
Standard.story = configureStory({});
