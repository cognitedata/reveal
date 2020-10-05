import React from 'react';
import { mount } from 'enzyme';
import { FileInfo } from '@cognite/sdk';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';
import { FileDetailsAbstract } from './FileDetailsAbstract';

const file: FileInfo = {
  name: 'Hello',
  id: 123,
  uploaded: false,
  lastUpdatedTime: new Date(),
  createdTime: new Date(),
};

describe('FileDetailsAbstract', () => {
  it('render normally', () => {
    const container = mount(
      <ResourceSelectionProvider>
        <FileDetailsAbstract file={file} />
      </ResourceSelectionProvider>
    );

    expect(container.text()).toContain(file.name);
  });
});
