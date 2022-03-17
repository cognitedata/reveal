import React from 'react';
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import Extractors from './Extractors';

describe('Extractors', () => {
  it('Renders without exploding', () => {
    const wrapper = shallow(
      <MemoryRouter>
        <Extractors />
      </MemoryRouter>
    );
    expect(wrapper).toHaveLength(1);
  });
});
