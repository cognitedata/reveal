import React from 'react';

import { screen, fireEvent } from '@testing-library/react';
import { fixtureClassifier } from 'src/__fixtures__/sdk/classifier';
import { testRender } from 'src/utils/test/render';

import { ActiveModelContainer } from './ActiveModelContainer';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ project: 'test' }),
  useLocation: () => ({ search: '' }),
  useNavigate: () => undefined,
}));

describe('component:ActiveModelContainer', () => {
  it('Renders the empty container when classifier is undefined', () => {
    testRender(<ActiveModelContainer />);

    expect(screen.getByRole('heading')).toHaveTextContent('No deployed model');
  });

  it('Renders the container with classifier information', () => {
    const mockClick = jest.fn();

    testRender(
      <ActiveModelContainer
        classifier={fixtureClassifier.one()}
        onViewConfusionMatrixClick={mockClick}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /View confusion matrix/i })
    );

    expect(screen.getByRole('heading')).toHaveTextContent('Deployed model');
    expect(mockClick).toBeCalled();
  });
});
