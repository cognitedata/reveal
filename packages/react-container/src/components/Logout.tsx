import React from 'react';
import { Button } from '@cognite/cogs.js';
import { saveFlow } from '@cognite/auth-utils';

import { storage } from '../utils';

// get these from container perhaps?
const AUTH_RESULT_STORAGE_KEY = 'authResult';
const KEY_LAST_TENANT = 'last_CDF_project';

export const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    storage.removeItem(AUTH_RESULT_STORAGE_KEY);
    storage.removeItem(KEY_LAST_TENANT);

    saveFlow('UNKNOWN');

    window.location.href = '/';
  };
  return (
    <Button type="secondary" icon="LogOut" onClick={handleLogout}>
      Logout
    </Button>
  );
};
