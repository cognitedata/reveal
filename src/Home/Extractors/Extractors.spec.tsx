import React from 'react';
import { shallow } from 'enzyme';
import Extractors from './Extractors';

describe('Extractor downloads', () => {
  it('Renders without exploding', () => {
    const wrapper = shallow(<Extractors />);
    expect(wrapper).toHaveLength(1);
  });
});
