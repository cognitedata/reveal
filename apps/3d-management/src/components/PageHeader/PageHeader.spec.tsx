import { MemoryRouter as Router } from 'react-router-dom';

import { render, screen } from '@testing-library/react';

import { PageHeader } from './PageHeader';

describe('NewHeader', () => {
  it('Renders without exploding', () => {
    const { baseElement } = render(<PageHeader title="test" />);
    expect(baseElement).toBeTruthy();
  });

  it('renders the title', () => {
    render(<PageHeader title="hello" />);
    expect(screen.getByRole('heading')).toHaveTextContent('hello');
  });

  it('renders the elements passed to it', () => {
    render(<PageHeader title="hello" rightItem={<h1>RIGHT ITEM TEXT</h1>} />);
    expect(screen.getByRole('heading')).toHaveTextContent('RIGHT ITEM TEXT');
  });

  it('renders links for breadcrummbs', () => {
    render(
      <Router>
        <PageHeader
          title="breadCrumbTest"
          breadcrumbs={[{ title: 'breadcrumbPath', path: '/url' }]}
        />
      </Router>
    );

    expect(() =>
      screen.findByRole('link', { name: 'breadcrumbPath' })
    ).resolves.toHaveAttribute('path', '/url');
  });
});
