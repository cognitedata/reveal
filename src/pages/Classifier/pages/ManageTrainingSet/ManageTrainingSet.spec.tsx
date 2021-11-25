import { screen } from '@testing-library/react';
import React from 'react';
import { testRender } from 'utils/test/render';
// eslint-disable-next-line jest/no-mocks-import
import { mockClassifierName, mockProject } from '__mocks__/sdk';
import { ManageTrainingSets } from './ManageTrainingSet';

jest.mock('react-router-dom', () => ({
  useParams: () => ({
    project: mockProject,
    classifierName: mockClassifierName,
  }),
  useLocation: () => ({ search: '' }),
}));

describe('page:ManageTrainingSet', () => {
  it('works', () => {
    testRender(<ManageTrainingSets Widget={jest.fn()} />);

    expect(
      screen.getByRole('button', { name: /Train classifier/i })
    ).toBeDisabled();
  });
});
