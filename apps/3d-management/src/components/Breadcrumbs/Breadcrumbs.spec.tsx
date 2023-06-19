import React from 'react';
import { MemoryRouter as Router } from 'react-router-dom';

import { mount } from 'enzyme';

import Breadcrumbs from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('Renders without exploding', () => {
    const wrapper = mount(
      <Router>
        <Breadcrumbs breadcrumbs={[]} />
      </Router>
    );
    expect(wrapper).toHaveLength(1);
  });
});
