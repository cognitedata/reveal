import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

import { DocumentTable } from '../DocumentTable';

configure({ adapter: new Adapter() });

describe('DocumentTable', () => {
  it('Renders without exploding', () => {
    const wrapper = mount(<DocumentTable docs={[]} />);
    expect(wrapper).toHaveLength(1);
  });

  it('Correctly renders unknown category', () => {
    const wrapper = mount(
      <DocumentTable
        docs={[
          {
            id: 1,
            fileName: 'file name 1',
            metadata: {
              DOC_TITLE: 'document title 1',
            },
          },
        ]}
      />
    );
    expect(wrapper.find('.ant-collapse-header').hostNodes().text()).toBe(
      'Unknown document type 1'
    );
  });

  it('Correctly renders custom unknown category', () => {
    const wrapper = mount(
      <DocumentTable
        docs={[
          {
            id: 1,
            fileName: 'file name 1',
            metadata: {
              DOC_TITLE: 'document title 1',
            },
          },
        ]}
        unknownCategoryName="Unknown"
      />
    );
    expect(wrapper.find('.ant-collapse-header').hostNodes().text()).toBe(
      'Unknown 1'
    );
  });

  it('Correctly renders without metadata', () => {
    const wrapper = mount(
      <DocumentTable
        docs={[
          {
            id: 1,
            fileName: 'file name 1',
          },
        ]}
      />
    );
    expect(wrapper.find('.ant-collapse-header').hostNodes().text()).toBe(
      'Unknown document type 1'
    );
  });

  it('Correctly finds type in name', () => {
    const wrapper = mount(
      <DocumentTable
        docs={[
          {
            id: 1,
            fileName: 'DN02-SM-P-XB-2103-01-11L.svg',
          },
        ]}
      />
    );
    expect(wrapper.find('.ant-collapse-header').hostNodes().text()).toBe(
      'P&ID 1'
    );
  });

  it('Correctly finds category from custom field', () => {
    const wrapper = mount(
      <DocumentTable
        docs={[
          {
            id: 1,
            fileName: 'file name 1',
            metadata: {
              Type: 'XB',
            },
          },
        ]}
        documentTypeField={['Type']}
      />
    );
    expect(wrapper.find('.ant-collapse-header').hostNodes().text()).toBe(
      'P&ID 1'
    );
  });

  it('Correctly finds title from custom field', () => {
    const wrapper = mount(
      <DocumentTable
        docs={[
          {
            id: 1,
            fileName: 'file name 1',
            metadata: {
              Title: 'Document title',
            },
          },
        ]}
        documentTitleField={['Title']}
      />
    );
    wrapper.find('.ant-collapse-header').hostNodes().simulate('click');
    expect(
      wrapper.find('[data-test-id="document-title"]').hostNodes().text()
    ).toBe('Document title');
  });

  it('Correctly finds types from custom docTypes', () => {
    const wrapper = mount(
      <DocumentTable
        docs={[
          {
            id: 1,
            fileName: 'file name 1',
            metadata: {
              DOC_TITLE: 'document title 1',
              DOC_TYPE: 'Test',
            },
          },
        ]}
        docTypes={{
          Test: 'foo',
        }}
      />
    );
    expect(wrapper.find('.ant-collapse-header').hostNodes().text()).toBe(
      'foo 1'
    );
  });

  it('Correctly prioritize based on categoryPriorityList', () => {
    const wrapper = mount(
      <DocumentTable
        docs={[
          {
            id: 1,
            fileName: 'file name 1',
            metadata: {
              DOC_TITLE: 'document title 1',
              DOC_TYPE: 'XB',
            },
          },
          {
            id: 1,
            fileName: 'file name 2',
            metadata: {
              DOC_TITLE: 'document title 2',
              DOC_TYPE: 'FA',
            },
          },
        ]}
        categoryPriorityList={['FA', 'XB']}
      />
    );
    expect(
      wrapper.find('.ant-collapse-header').hostNodes().first().text()
    ).toBe('Project manual, e.g. principal decisions 1');
    expect(wrapper.find('.ant-collapse-header').hostNodes().last().text()).toBe(
      'P&ID 1'
    );
  });

  it('can expand all categories by default', () => {
    const wrapper = mount(
      <DocumentTable
        docs={[
          {
            id: 1,
            fileName: 'file name 1',
            metadata: {
              DOC_TITLE: 'document title 1',
              DOC_TYPE: 'XB',
            },
          },
          {
            id: 1,
            fileName: 'file name 2',
            metadata: {
              DOC_TITLE: 'document title 2',
              DOC_TYPE: 'FA',
            },
          },
        ]}
        categoryPriorityList={['FA', 'XB']}
        defaultExpandAll={true}
      />
    );
    expect(
      wrapper.find('.ant-collapse-item-active').hostNodes().first().text()
    ).toContain('Project manual, e.g. principal decisions 1');
    expect(
      wrapper.find('.ant-collapse-item-active').hostNodes().last().text()
    ).toContain('P&ID 1');
  });

  it('Document clicked with expected props', () => {
    const handleDocumentClick = jest.fn();
    const wrapper = mount(
      <DocumentTable
        docs={[
          {
            id: 1,
            fileName: 'file name 1',
            metadata: {
              DOC_TYPE: 'XB',
            },
          },
        ]}
        handleDocumentClick={handleDocumentClick}
      />
    );
    wrapper.find('.ant-collapse-header').hostNodes().simulate('click');
    wrapper.find('[data-test-id="file-name"]').hostNodes().simulate('click');
    expect(handleDocumentClick.mock.calls[0][1]).toBe('XB');
    expect(handleDocumentClick.mock.calls[0][2]).toBe('P&ID');
  });

  it('No documents linked sign shown properly', () => {
    const wrapper = mount(<DocumentTable docs={[]} noDocumentsSign="None" />);
    expect(
      wrapper.find('[data-test-id="no-documents"]').hostNodes().text()
    ).toBe('None');
  });

  it('Category click is fired', () => {
    const handleCategoryClick = jest.fn();
    const wrapper = mount(
      <DocumentTable
        docs={[
          {
            id: 1,
            fileName: 'file name 1',
            metadata: {
              DOC_TYPE: 'XB',
            },
          },
        ]}
        collapseProps={{
          onChange: handleCategoryClick,
        }}
      />
    );
    wrapper.find('.ant-collapse-header').hostNodes().simulate('click');
    expect(handleCategoryClick.mock.calls[0][0]).toEqual(['XB']);
  });
});
