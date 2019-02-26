import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import { Component } from '../Component';

Enzyme.configure({ adapter: new Adapter() });

describe('Component', () => {
  it('Renders without exploding', () => {
    const wrapper = Enzyme.mount(<Component />);
    expect(wrapper).toHaveLength(1);
  });
});
