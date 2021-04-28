import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter as Router } from 'react-router-dom';
import { PageHeader } from './PageHeader';

global.window = { location: { pathname: null } };

describe('NewHeader', () => {
  it('Renders without exploding', () => {
    const wrapper = mount(<PageHeader />);
    expect(wrapper).toHaveLength(1);
  });

  it('renders the title', () => {
    const wrapper = mount(<PageHeader title="hello" />);
    expect(wrapper.find('h5').text()).toEqual('hello');
  });

  it('renders the elements passed to it', () => {
    const wrapper = mount(
      <PageHeader title="hello" rightItem={<h1>RIGHT ITEM TEXT</h1>} />
    );
    expect(wrapper.find('h1').text()).toEqual('RIGHT ITEM TEXT');
  });

  it('renders links for breadcrummbs', () => {
    const wrapper = mount(
      <Router>
        <PageHeader breadcrumbs={[{ title: 'breadcrumbPath', path: '/url' }]} />
      </Router>
    );

    expect(wrapper.find('a')).toHaveLength(2);
  });
});
