import { renderHook } from '@testing-library/react-hooks';
import useValidatePipelineName from 'hooks/useValidatePipelineName';
import { TestProviderWrapper } from 'utils/test/render';
import { useNavigation } from 'hooks/useNavigation';
// eslint-disable-next-line jest/no-mocks-import
import { mockProject } from '__mocks__/sdk';

jest.mock('react-router-dom', () => ({
  useParams: () => ({
    project: mockProject,
    classifierName: 'random',
  }),
}));

jest.mock('hooks/useNavigation', () => ({
  useNavigation: jest.fn(() => ({ toHome: jest.fn() })),
}));

describe('hook:useValidatePipelineName', () => {
  it('Redirects the user if the project in the url differs from classifier name', async () => {
    const { result, waitFor } = renderHook(() => useValidatePipelineName(), {
      wrapper: TestProviderWrapper,
    });

    await waitFor(() => !result.current[0]);

    expect(useNavigation).toBeCalled();
  });
});
