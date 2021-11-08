import { execSync } from 'child_process';
import os from 'os';

export const getTestUserId = () => {
  const userId = process.env.REACT_APP_E2E_USER; // locally this is how we get the user now

  if (userId) {
    if (userId === 'local') {
      const userInfo = execSync('git config user.email');

      return userInfo.toString().trim();
    }

    return userId;
  }

  // THIS ONLY WORKS FROM NODE - NOT FROM THE BROWSER
  // BROSWER ALWAYS GIVES: 'localhost'
  const host = os.hostname().split('-').slice(-1).join('');
  // return os.hostname();

  return host;
};
