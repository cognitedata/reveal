import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

export default {
  title: 'Home',
};

export const Base = () => {
  return (
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
};
