import React from 'react';
import { mount } from 'enzyme';
import PageTitle from './PageTitle';

describe('PageTitle', () => {
  it('Renders without exploding', () => {
    const wrapper = mount(
      <PageTitle
        title="Test title"
        subtitle="This is a test for the PageTitle component"
      />
    );
    expect(wrapper).toHaveLength(1);
  });
});
