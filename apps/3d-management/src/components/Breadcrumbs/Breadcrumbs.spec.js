import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter as Router } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('Renders without exploding', () => {
    const wrapper = mount(
      <Router>
        <Breadcrumbs />
      </Router>
    );
    expect(wrapper).toHaveLength(1);
  });
});
