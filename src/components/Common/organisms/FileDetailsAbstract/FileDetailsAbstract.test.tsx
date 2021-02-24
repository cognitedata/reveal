import React from 'react';
import { mount } from 'enzyme';
import { FileInfo } from '@cognite/sdk';
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
    const container = mount(<FileDetailsAbstract file={file} />);

    expect(container.text()).toContain(file.name);
  });
});
