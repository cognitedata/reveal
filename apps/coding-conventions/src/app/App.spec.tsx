import { BrowserRouter } from 'react-router-dom';

import { render } from '@testing-library/react';

// import App from './App';

describe.skip('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>{/* <App /> */}</BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getByText } = render(
      <BrowserRouter>{/* <App /> */}</BrowserRouter>
    );
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText(/Welcome coding-conventions/gi)).toBeTruthy();
  });
});
