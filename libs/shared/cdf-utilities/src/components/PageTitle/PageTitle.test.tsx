import React from 'react';

import { render } from '@testing-library/react';

import PageTitle from '.';

describe('PageTitle', () => {
  it('Default page title should be Cognite Data Fusion', () => {
    render(<PageTitle />);
    expect(document.title).toEqual('Cognite Data Fusion');
  });

  it('should apply the document title to the page', () => {
    render(<PageTitle title="Hello world" />);
    expect(document.title).toEqual('Hello world | Cognite Data Fusion');
  });

  it('A nested sub title should override initial PageTitle', () => {
    render(
      <div>
        <PageTitle title="Hello world" />
        <PageTitle title="TESTING" />
      </div>
    );
    expect(document.title).toEqual('TESTING | Cognite Data Fusion');
  });
});
