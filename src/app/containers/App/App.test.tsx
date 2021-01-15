import React from 'react';
import { render } from 'testUtils';
import App from './App';

describe('App', () => {
  it('renders with warnings but without crashing', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });
});
