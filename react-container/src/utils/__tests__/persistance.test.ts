import {
  removeAuthResultFromStorage,
  retrieveAccessToken,
  persistAuthResult,
} from '../persistance';

const writeToken = () => {
  persistAuthResult({
    user: 'test-user',
    idToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdC11c2VyIiwiaWRUb2tlbiI6InRlc3QtaWQiLCJhY2Nlc3NUb2tlbiI6InRlc3QtdG9rZW4ifQ.gnf4GjNvUKfw4CjMcF6L7-56g9mqBIVUyPSQnLgasag',
    accessToken: 'test-token',
  });
};
describe('persistance', () => {
  it('should be undefined with nothing set', () => {
    expect(retrieveAccessToken()).toEqual(undefined);
  });
  it('should get a set token', () => {
    writeToken();
    expect(retrieveAccessToken()).toEqual('test-token');
  });
  it('should remove a token', () => {
    writeToken();
    removeAuthResultFromStorage();
    expect(retrieveAccessToken()).toEqual(undefined);
  });
});
