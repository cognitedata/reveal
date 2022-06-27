import React from 'react';
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
} from 'kbar';
import { useHistory } from 'react-router-dom';

import { RenderResults } from '../../components/RenderResults';

import { ThemeContext } from './ThemeProvider';

const searchStyle = {
  padding: '12px 16px',
  fontSize: '16px',
  width: '100%',
  boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
  outline: 'none',
  border: 'none',
  background: 'rgb(252 252 252)',
  color: 'rgba(0 0 0 / 0.9)',
};

const animatorStyle = {
  maxWidth: '600px',
  width: '100%',
  background: 'rgb(252 252 252)',
  color: 'rgb(28 28 29)',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0px 6px 20px rgb(0 0 0 / 20%)',
};

export const KBarProviderWrapper: React.FC = ({ children }) => {
  const { setMode } = React.useContext(ThemeContext);
  const history = useHistory();
  const actions = [
    {
      id: 'home',
      name: 'Home',
      shortcut: ['h'],
      keywords: 'home',
      section: 'navigation',
      perform: () => history.push('/home'),
    },
    {
      id: 'search',
      name: 'Search',
      shortcut: ['s'],
      keywords: 'look for',
      section: 'navigation',
      perform: () => history.push('/search'),
    },
    {
      id: 'darkMode',
      name: 'Dark Mode',
      shortcut: ['d'],
      keywords: 'dark mode',
      section: 'change theme',
      perform: () => setMode('dark'),
    },
    {
      id: 'lightMode',
      name: 'Light Mode',
      shortcut: ['l'],
      keywords: 'light mode',
      section: 'change theme',
      perform: () => setMode('light'),
    },
  ];

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner>
          <KBarAnimator style={animatorStyle}>
            <KBarSearch style={searchStyle} />
            <RenderResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
};
