import globalReducer from './globalReducer';

describe('global reducer', () => {
  it('should set authenticated user', () => {
    const mockUser = {
      user: '123',
      project: 'test',
      projectId: 'test',
    };

    expect(
      globalReducer.reducer(
        {
          authenticatedUser: {
            user: '',
            project: '',
            projectId: '',
          },
        },
        {
          type: globalReducer.actions.setAuthenticatedUser,
          payload: mockUser,
        }
      ).authenticatedUser
    ).toEqual(expect.objectContaining(mockUser));
  });
});
