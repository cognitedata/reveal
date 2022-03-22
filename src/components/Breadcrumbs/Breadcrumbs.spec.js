import React from 'react';
import { shallow } from 'enzyme';
import { MemoryRouter as Router } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('Renders without exploding', () => {
    const wrapper = shallow(
      <Router>
        <Breadcrumbs />
      </Router>
    );
    expect(wrapper).toHaveLength(1);
  });
});
