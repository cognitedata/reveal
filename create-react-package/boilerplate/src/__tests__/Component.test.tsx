import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { Component } from '../Component';

configure({ adapter: new Adapter() });

describe('Component', () => {
  it('Renders without exploding', () => {
    const wrapper = mount(<Component />);
    expect(wrapper).toHaveLength(1);
  });
});
