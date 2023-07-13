import * as React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Meta, StoryFn } from '@storybook/react';

import { UserProfilePage } from './UserProfilePage';

export default {
  component: UserProfilePage,
} as Meta<typeof UserProfilePage>;

export const Default: StoryFn<typeof UserProfilePage> = (args) => (
  <BrowserRouter>
    <Routes>
      <Route path="*" element={<UserProfilePage {...args} />} />
    </Routes>
  </BrowserRouter>
);

Default.args = {
  userInfo: { name: 'John', email: 'john@example.com' },
  selectedLanguage: { code: 'en', label: 'English | en' },
  supportedLanguages: [{ code: 'en', label: 'English | en' }],
  onLanguageChange: (language) => console.log(language),
};
