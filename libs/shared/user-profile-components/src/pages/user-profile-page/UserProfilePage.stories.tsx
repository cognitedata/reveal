import * as React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';

import { UserProfilePage } from './UserProfilePage';

type Story = StoryObj<typeof UserProfilePage>;

export default {
  component: UserProfilePage,
  args: {
    userInfo: { name: 'John', email: 'john@example.com' },
    selectedLanguage: { code: 'en', label: 'English | en' },
    supportedLanguages: [{ code: 'en', label: 'English | en' }],
    onLanguageChange: (language) => console.log(language),
  },
} as Meta<typeof UserProfilePage>;

export const Default: Story = {
  render: (args) => (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<UserProfilePage {...args} />} />
      </Routes>
    </BrowserRouter>
  ),
};

export const OnBackBtnClick: Story = {
  name: 'Controlling back button click',
  render: (args) => (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            <UserProfilePage
              onBackBtnClick={action('onBackBtnClick')}
              {...args}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  ),
};
