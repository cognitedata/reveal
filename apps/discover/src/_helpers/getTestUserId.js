import os from 'os';

export const getTestUserId = () => {
  const userId = process.env.REACT_APP_E2E_USER; // locally this is how we get the user now

  if (userId) {
    return userId;
  }
  // console.log('Before');

  // try {
  //   console.log('Try');
  //   const fetching = import('../uniqueUserId').then((uniqueUserId) => {
  //     console.log('uniqueUserId', uniqueUserId);
  //     return `user-${uniqueUserId}`;
  //   });

  //   return fetching;
  // } catch (e) {
  //   console.log('Catch', e);
  // }

  // THIS ONLY WORKS FROM NODE - NOT FROM THE BROWSER
  // BROSWER ALWAYS GIVES: 'localhost'
  return os.hostname().split('-').slice(-1).join('');
  // return os.hostname();
};
