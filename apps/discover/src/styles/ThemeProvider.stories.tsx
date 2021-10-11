import { useState } from 'react';

import withThemeProvider from 'storybook/utils/themeDecorator';

import { Button } from '@cognite/cogs.js';

import { Paper } from 'components/paper';

import defaultPalette from './default.palette';
import { createTheme } from './defaultTheme';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';

export default {
  title: 'Styles / ThemeProvider',
  component: ThemeProvider,
};
export const full = () => <Story />;

export const themeHook = () => {
  const theme = useTheme();
  return (
    <Button
      variant="default"
      style={{ backgroundColor: theme.palette.secondary.opacity40 }}
    >
      useTheme - Secondary opacity40
    </Button>
  );
};

themeHook.story = {
  decorators: [withThemeProvider],
};

const UseThemeButton = () => {
  const theme = useTheme();
  return (
    <Button
      variant="default"
      style={{ backgroundColor: theme.palette.secondary.opacity40 }}
    >
      useTheme - Secondary opacity40
    </Button>
  );
};

const Story = () => {
  const [theme, setTheme] = useState(createTheme(defaultPalette));

  const handleOnClick = (color: string) => {
    const palette = { ...defaultPalette, primary: color, secondary: color };
    setTheme(createTheme(palette));
  };

  return (
    <div>
      <ThemeProvider theme={theme}>
        <Paper elevation={4}>
          <>
            <Button variant="default" onClick={() => handleOnClick('#00FF00')}>
              Set color to green
            </Button>{' '}
            <span />
            <Button variant="default" onClick={() => handleOnClick('#FF0000')}>
              Set color to red
            </Button>{' '}
            <span />
            <Button variant="default" onClick={() => handleOnClick('#0000FF')}>
              Set color to blue
            </Button>{' '}
            <br /> <br />
            <Button variant="outline" onClick={() => handleOnClick('#00FF00')}>
              Set color to green
            </Button>{' '}
            <span />
            <Button variant="outline" onClick={() => handleOnClick('#FF0000')}>
              Set color to red
            </Button>{' '}
            <span />
            <Button variant="outline" onClick={() => handleOnClick('#0000FF')}>
              Set color to blue
            </Button>
            <br /> <br />
            <Button type="ghost" onClick={() => handleOnClick('#00FF00')}>
              Set color to green
            </Button>{' '}
            <span />
            <Button type="ghost" onClick={() => handleOnClick('#FF0000')}>
              Set color to red
            </Button>{' '}
            <span />
            <Button type="ghost" onClick={() => handleOnClick('#0000FF')}>
              Set color to blue
            </Button>
            <br />
            <br />
            <Button type="primary">Use Themed button</Button>
            <UseThemeButton />
          </>
        </Paper>
      </ThemeProvider>
    </div>
  );
};
