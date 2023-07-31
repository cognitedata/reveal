# ThemeProvider

```js
import { ThemeProvider } from 'eureka-webcomponents';
```

<!-- Brief summary of what the component is, and what it's for. -->

<!-- STORY -->

#### Example

```js
import { ThemeProvider } from 'eureka-webcomponents';
import { createTheme } from 'eureka-webcomponents';
const Story = () => {
  const [theme, setTheme] = useState(createTheme(defaultPalette));

  const handleOnClick = (color) => {
    const palette = { ...defaultPalette, primary: color, secondary: color };
    setTheme(createTheme(palette));
  };

  return (
    <div>
      <ThemeProvider theme={theme}>
        <Paper elevation={4}>
          <>
            <Button
              variant="contained"
              onClick={() => handleOnClick('#00FF00')}
            >
              Set color to green
            </Button>{' '}
            <span />
            <Button
              variant="contained"
              onClick={() => handleOnClick('#FF0000')}
            >
              Set color to red
            </Button> <span />
            <Button
              variant="contained"
              onClick={() => handleOnClick('#0000FF')}
            >
              Set color to blue
            </Button>{' '}
            <br /> <br />
            <Button variant="outline" onClick={() => handleOnClick('#00FF00')}>
              Set color to green
            </Button> <span />
            <Button variant="outline" onClick={() => handleOnClick('#FF0000')}>
              Set color to red
            </Button>{' '}
            <span />
            <Button variant="outline" onClick={() => handleOnClick('#0000FF')}>
              Set color to blue
            </Button>
            <br /> <br />
            <Button variant="text" onClick={() => handleOnClick('#00FF00')}>
              Set color to green
            </Button> <span />
            <Button variant="text" onClick={() => handleOnClick('#FF0000')}>
              Set color to red
            </Button>{' '}
            <span />
            <Button variant="text" onClick={() => handleOnClick('#0000FF')}>
              Set color to blue
            </Button>
          </>
        </Paper>
      </ThemeProvider>
    </div>
  );
};
```

<!-- STORY HIDE START -->

<!-- STORY HIDE END -->
