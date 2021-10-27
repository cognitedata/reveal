import React from 'react';

import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import Breadcrumb from './Breadcrumb';

const BREADCRUMB_ITEM_PATH = '/path-1';
const BREADCRUMB_ITEM_TITLE = 'PATH 1';
const BREADCRUMB_ITEMS = [
  { path: BREADCRUMB_ITEM_PATH, title: BREADCRUMB_ITEM_TITLE },
];

describe('Breadcrumb', () => {
  it('should be rendered correctly', async () => {
    const history = createMemoryHistory();

    render(
      <Router history={history}>
        <Breadcrumb items={BREADCRUMB_ITEMS} />
      </Router>
    );

    const breadcrumbItems = screen.getAllByLabelText('Breadcrumb link');
    expect(breadcrumbItems).toHaveLength(2);
    expect(breadcrumbItems[0]).toHaveTextContent('Fusion');
    expect(breadcrumbItems[1]).toHaveTextContent(BREADCRUMB_ITEM_TITLE);
    expect(breadcrumbItems[1]).toHaveAttribute(
      'href',
      `/${BREADCRUMB_ITEM_PATH}`
    );

    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(1);
  });
});
