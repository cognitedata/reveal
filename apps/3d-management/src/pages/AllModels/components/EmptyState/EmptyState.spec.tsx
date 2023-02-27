import React from 'react';
import { mount } from 'enzyme';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('Renders without exploding', () => {
    const wrapper = mount(<EmptyState />);
    expect(wrapper).toHaveLength(1);
  });
});
