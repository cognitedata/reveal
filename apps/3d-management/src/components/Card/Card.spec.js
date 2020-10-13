import React from 'react';
import { mount } from 'enzyme';
import Card from './Card';

describe('Card', () => {
  it('Renders without exploding', () => {
    const wrapper = mount(<Card />);
    expect(wrapper).toHaveLength(1);
  });
});
