import React from 'react';
import { render, screen } from '@testing-library/react';
import { Example } from './{{ properCase simpleName }}.stories';

describe('{{ properCase simpleName }}', () => {
  it('renders the right content', () => {
    render(<Example text="Nice!" />);
    expect(screen.getByRole('heading', { name: 'Nice!' })).toBeInTheDocument();
  });
});
