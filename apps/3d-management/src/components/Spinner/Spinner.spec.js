import React from 'react';
import { mount } from 'enzyme';
import Spinner from './Spinner';

describe('Spinner', () => {
  it('Renders without exploding', () => {
    const wrapper = mount(<Spinner />);
    expect(wrapper).toHaveLength(1);
  });
});
