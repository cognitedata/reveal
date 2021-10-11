import { createMuiTheme } from '@material-ui/core/styles';

import defaultPalette from './default.palette';

const componentToHex = (c) => {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

const rgbToHex = (value) => {
  return `#${componentToHex(value[0])}${componentToHex(
    value[1]
  )}${componentToHex(value[2])}`;
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )})`
    : null;
};

const interpolateColor = (color1, color2, factor = 0.5) => {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return result;
};

const interpolateColors = (color1, color2, steps) => {
  const stepFactor = 1 / steps;
  const interpolatedColorArray = [];

  const rgbColor1 = color1.match(/\d+/g).map(Number);
  const rgbColor2 = color2.match(/\d+/g).map(Number);

  for (let i = 0; i < steps; i++) {
    interpolatedColorArray.push(
      interpolateColor(rgbColor1, rgbColor2, stepFactor * i)
    );
  }
  return interpolatedColorArray;
};

export function createTheme(colorPalette) {
  const primaryRgb = hexToRgb(colorPalette.primary);
  const primaryColors = interpolateColors(primaryRgb, 'rgb(255, 255, 255)', 20);
  const secondaryRgb = hexToRgb(colorPalette.secondary);
  const secondaryColors = interpolateColors(
    secondaryRgb,
    'rgb(255, 255, 255)',
    20
  );

  const blackRgb = hexToRgb(colorPalette.black);
  const blackColors = interpolateColors(blackRgb, 'rgb(255, 255, 255)', 20);

  const errorRgb = hexToRgb(colorPalette.error);
  const errorColors = interpolateColors(errorRgb, 'rgb(255, 255, 255)', 20);

  const tertieryRgb = hexToRgb(colorPalette.green);
  const tertieryColors = interpolateColors(
    tertieryRgb,
    'rgb(255, 255, 255)',
    20
  );

  const primary = {
    opacity80: rgbToHex(primaryColors[4]),
    opacity60: rgbToHex(primaryColors[8]),
    opacity40: rgbToHex(primaryColors[12]),
    opacity20: rgbToHex(primaryColors[16]),
    opacity10: rgbToHex(primaryColors[18]),
    opacity5: rgbToHex(primaryColors[19]),
  };

  const secondary = {
    opacity80: rgbToHex(secondaryColors[4]),
    opacity60: rgbToHex(secondaryColors[8]),
    opacity40: rgbToHex(secondaryColors[12]),
    opacity20: rgbToHex(secondaryColors[16]),
    opacity10: rgbToHex(secondaryColors[18]),
    opacity5: rgbToHex(secondaryColors[19]),
  };

  const black = {
    opacity90: rgbToHex(blackColors[2]),
    opacity80: rgbToHex(blackColors[4]),
    opacity70: rgbToHex(blackColors[6]),
    opacity60: rgbToHex(blackColors[8]),
    opacity40: rgbToHex(blackColors[12]),
    opacity20: rgbToHex(blackColors[16]),
    opacity10: rgbToHex(blackColors[18]),
    opacity5: rgbToHex(blackColors[19]),
  };
  const error = {
    opacity90: rgbToHex(errorColors[2]),
    opacity80: rgbToHex(errorColors[4]),
    opacity70: rgbToHex(errorColors[6]),
    opacity60: rgbToHex(errorColors[8]),
    opacity40: rgbToHex(errorColors[12]),
    opacity20: rgbToHex(errorColors[16]),
    opacity10: rgbToHex(errorColors[18]),
    opacity5: rgbToHex(errorColors[19]),
  };

  const tertiery = {
    opacity90: rgbToHex(tertieryColors[2]),
    opacity80: rgbToHex(tertieryColors[4]),
    opacity70: rgbToHex(tertieryColors[6]),
    opacity60: rgbToHex(tertieryColors[8]),
    opacity40: rgbToHex(tertieryColors[12]),
    opacity20: rgbToHex(tertieryColors[16]),
    opacity10: rgbToHex(tertieryColors[18]),
    opacity5: rgbToHex(tertieryColors[19]),
  };

  const theme = createMuiTheme({
    spacing: 8,
    palette: {
      primary: {
        main: colorPalette.primary,
        text: colorPalette.primaryContrast,
        opacity80: primary.opacity80,
        opacity60: primary.opacity60,
        opacity40: primary.opacity40,
        opacity20: primary.opacity20,
        opacity10: primary.opacity10,
        opacity5: primary.opacity5,
      },
      secondary: {
        main: colorPalette.secondary,
        text: colorPalette.secondaryContrast,
        opacity80: secondary.opacity80,
        opacity60: secondary.opacity60,
        opacity40: secondary.opacity40,
        opacity20: secondary.opacity20,
        opacity10: secondary.opacity10,
        opacity5: secondary.opacity5,
      },
      black: {
        main: colorPalette.black,
        opacity90: black.opacity90,
        opacity80: black.opacity80,
        opacity70: black.opacity70,
        opacity60: black.opacity60,
        opacity40: black.opacity40,
        opacity20: black.opacity20,
        opacity10: black.opacity10,
        opacity5: black.opacity5,
        text: colorPalette.white,
      },
      error: {
        main: colorPalette.error,
        opacity90: error.opacity90,
        opacity80: error.opacity80,
        opacity70: error.opacity70,
        opacity60: error.opacity60,
        opacity40: error.opacity40,
        opacity20: error.opacity20,
        opacity10: error.opacity10,
        opacity5: error.opacity5,
      },
      tertiery: {
        main: colorPalette.green,
        opacity90: tertiery.opacity90,
        opacity80: tertiery.opacity80,
        opacity70: tertiery.opacity70,
        opacity60: tertiery.opacity60,
        opacity40: tertiery.opacity40,
        opacity20: tertiery.opacity20,
        opacity10: tertiery.opacity10,
        opacity5: tertiery.opacity5,
      },
      quaternary: {
        main: colorPalette.orange,
      },
      white: colorPalette.white,
      gray: colorPalette.gray,
      lightgrey: colorPalette.lightgrey,

      blue: colorPalette.blue,

      background1: colorPalette.topContent.background,
      background2: colorPalette.mainContent.background,
      background3: colorPalette.background3,
      tooltip: {
        ...colorPalette.tooltip,
      },
      menuIcon: {
        default: colorPalette.menuIcon.default,
        selected: colorPalette.menuIcon.selected,
      },
      drawer: {
        background: colorPalette.primary,
      },
      divider: black.opacity20,
    },
    tooltip: {
      background: '#333333',
      color: '#FFF',
    },
    button: {
      color: '#FFF',
      background: '#012749',
      borderColor: '#012749',

      hover: {
        background: '#274764',
        borderColor: '#ccd4db',
        color: '#FFF',
      },
      disabled: {
        background: '#274764',
        borderColor: '#ccd4db',
        color: '#FFF',
      },
      outlined: {
        active: {
          borderColor: colorPalette.secondary,
        },
      },
      text: {
        color: colorPalette.secondary,
        hover: {
          background: secondary.opacity20,
        },
      },
    },
    card: {
      color: '#666',
      backgroundColor: '#FFFFFF',
      borderColor: '#d2d2d2',
      titleColor: '#000028',
    },

    toast: {
      success: { background: '#d9f1e0', color: '#000' },
      error: { background: '#ffe2e2', color: '#000' },
      info: { background: '#e6e9ed', color: '#000' },
      warning: { background: '#fcebd9', color: '#000' },
      default: { background: '#333333', color: '#FFF' },
      action: { color: '#4A67FB' },
    },
    table: {
      head: {
        backgroundColor: primary.opacity10,
        color: colorPalette.primary,
        selected: {
          backgroundColor: primary.opacity20,
        },
      },
      body: {
        backgroundColor: colorPalette.secondaryContrast,
        color: colorPalette.akerBlack80,
      },
    },

    // OVERRIDES//

    overrides: {
      MuiIconButton: {
        root: {
          '&:hover': {
            backgroundColor: '(0, 0, 0, 0)',
          },
        },
      },
      MuiPickersToolbar: {
        toolbar: {
          backgroundColor: colorPalette.secondary,
        },
      },
      // MuiPickersYear: {
      //   '&$selected': {
      //     backgroundColor: colorPalette.secondary,
      //   },
      // },
    },
  });
  return theme;
}

export const defaultTheme = createTheme(defaultPalette);

export default defaultTheme;
