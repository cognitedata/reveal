import { screen } from '@testing-library/react';
import React from 'react';
import { testRender } from 'src/utils/test/render';
import { mockClassifierName, mockProject } from 'src/__mocks__/sdk';
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

    expect(
      screen.getByRole('button', { name: /Train classifier/i })
    ).toBeDisabled();
  });
});
