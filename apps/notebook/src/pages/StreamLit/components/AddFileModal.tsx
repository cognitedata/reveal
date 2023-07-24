import { useState } from 'react';

import {
  Modal,
  Input,
  Body,
  Radio,
  Divider,
  Icon,
  Flex,
  RadioGroup,
} from '@cognite/cogs.js';

import { fileTemplates, FileTemplate } from '../fileTemplates';

import { Selector } from './Selector';

type AddFileProps = {
  onCancel: () => void;
  existingFileNames: string[];
  onCreate: (fileName: string, template: FileTemplate) => void;
};

export const AddFileModal = ({
  onCancel,
  onCreate,
  existingFileNames,
}: AddFileProps) => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('Page');
  const [selectedTemplate, setSelectedTemplate] = useState(
    'Empty file with Cognite SDK'
  );

  const pressCreateDisabled =
    fileName.trim() === '' ||
    existingFileNames.includes(fileName) ||
    (['Page', 'Library'].includes(fileType) &&
      (!fileName.endsWith('.py') || fileName.trim() === '.py'));

  return (
    <Modal
      visible
      okDisabled={pressCreateDisabled}
      onCancel={() => onCancel()}
      onOk={() => {
        // A page is placed in the pages folder
        const fullFileName =
          fileType === 'Page' ? `pages/${fileName}` : fileName;
        onCreate(
          fullFileName,
          fileTemplates.filter(
            (template) => template.title === selectedTemplate
          )[0]
        );
      }}
      okText="Create"
      title="Add file"
    >
      <Flex direction="column" gap={16}>
        <Body level={3}>
          File name
          {['Page', 'Library'].includes(fileType)
            ? ' (must end with .py)'
            : ''}{' '}
          *
        </Body>
        <Input
          autoFocus
          fullWidth
          value={fileName}
          onChange={(event) => setFileName(event.target.value)}
          placeholder="Enter file name"
        />
        <RadioGroup label="File type" value={fileType} name="">
          <Radio
            name="Page"
            value="Page"
            onChange={() => setFileType('Page')}
            label="Page: A page is a Python file that can be viewed in the app"
          />
          <Radio
            name="Library"
            value="Library"
            onChange={() => setFileType('Library')}
            label="Library: A library is a Python file that can be imported in a page"
          />
        </RadioGroup>
        <Divider />
        <Selector>
          {fileTemplates.map((template) => (
            <Selector.Item
              key={template.title}
              onClick={() => setSelectedTemplate(template.title)}
              $isSelected={selectedTemplate === template.title}
            >
              <Icon type="DocumentCode" />
              <Flex direction="column" style={{ flex: 1 }}>
                <Body className="name" strong>
                  {template.title}
                </Body>
                <Body level={3} className="description" muted>
                  {template.description}
                </Body>
              </Flex>
            </Selector.Item>
          ))}
        </Selector>
      </Flex>
    </Modal>
  );
};
