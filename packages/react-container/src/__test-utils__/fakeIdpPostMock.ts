import { rest } from 'msw';

export const fakeIdpLoginPost = () => {
  const url = `http://localhost:8200/login/token`;
  return rest.post(url, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        // mock token I generated on https://jwt.io/
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1c2VyIjoidGVzdC11c2VyIn0.1LqNUaFeA0eTWUIrLt30mDMFKrulXsYG5qAKvdbss-c',
        id_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1c2VyIjoidGVzdC11c2VyIn0.1LqNUaFeA0eTWUIrLt30mDMFKrulXsYG5qAKvdbss-c',
      })
    );
  });
};
