import React from 'react';

import { screen } from '@testing-library/react';
import { mockClassifierName, mockProject } from 'src/__mocks__/sdk';
import { testRender } from 'src/utils/test/render';

import { ManageTrainingSets } from './ManageTrainingSet';

jest.mock('react-router-dom', () => ({
  useParams: () => ({
    project: mockProject,
    classifierName: mockClassifierName,
  }),
  useLocation: () => ({ search: '' }),
  useNavigate: () => undefined,
}));

describe('page:ManageTrainingSet', () => {
  it('works', () => {
    testRender(<ManageTrainingSets Widget={jest.fn()} />);

    expect(screen.getByTestId('add-labels').getAttribute('aria-disabled')).toBe(
      'false'
    );
  });
});
