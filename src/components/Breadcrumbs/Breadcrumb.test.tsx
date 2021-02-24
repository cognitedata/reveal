import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter, Route } from 'react-router-dom';
import { mockStore } from 'utils/mockStore';
import { Provider } from 'react-redux';
import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  const store = mockStore({});
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('cannot render with no routes.', () => {
    // Test first render and effect
    const container = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/123/123']}>
          <Route
            path="/:tenant"
            render={() => <Breadcrumbs routesMap={[() => ({})]} />}
          />
        </MemoryRouter>
      </Provider>
    );
    const wrapper = container.find('.breadcrumb-steps');

    // Test second render and effect
    expect(wrapper).toEqual({});
  });

  it('can render with simple breadcrumbs.', () => {
    // Test first render and effect
    const container = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/123/123']}>
          <Route
            path="/:tenant"
            render={() => (
              <Breadcrumbs routesMap={{ '/123/123': ['Should Show'] }} />
            )}
          />
        </MemoryRouter>
      </Provider>
    );
    const wrapper = container.find('.breadcrumb-steps');
    // Test second render and effect
    expect(wrapper.text()).toContain('Should Show');
    // Test first render and effect
    const container2 = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/123']}>
          <Route
            path="/:tenant"
            render={() => (
              <Breadcrumbs routesMap={{ '/123/123': ['Should Show'] }} />
            )}
          />
        </MemoryRouter>
      </Provider>
    );
    const wrapper2 = container2.find('.breadcrumb-steps');

    // Test second render and effect
    expect(wrapper2).toEqual({});
  });

  it('can render with function based breadcrumbs.', () => {
    // Test first render and effect
    const container = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/123/123']}>
          <Route
            path="/:tenant"
            render={() => (
              <Breadcrumbs
                routesMap={{
                  '/:tenant/123': ({ tenant }) => [tenant, 'Should Show'],
                }}
              />
            )}
          />
        </MemoryRouter>
      </Provider>
    );
    const wrapper = container.find('.breadcrumb-steps');

    // Test second render and effect
    expect(wrapper.text()).toContain('123');
    expect(wrapper.text()).toContain('Should Show');
  });
});
