// https://www.styled-components.com/docs/advanced#theming
// put color definitions, and other re-usable css stuff here.

import { Colors } from '@cognite/cogs.js';

export default {
  backgroundColor: Colors.grey2,
  actionText: Colors.midBlue,
  textColor: Colors.textColor,
  borderColor: Colors.grey2,
  primaryBorder: Colors.midBlue,
  primaryBackground: Colors.midBlue,
  pillBackground: Colors.lighterMidBlue,
  titleOrnamentColor: Colors.midBlue,
  accentColor: Colors.weirdYellow,
  breadcrumbsText: Colors.grey6,
  breadcrumbsBackground: Colors.grey3,
  subtitleColor: Colors.grey7,
  specificTitleOrnamentColor: Colors.midBlue,
  subtleAction: Colors.grey6,
  noStatusColor: Colors.weirdYellow,
  successColor: Colors.successGreen,
  disabledColor: Colors.grey4,
  blandColor: Colors.grey5,
  dangerColor: Colors.dangerRed,
  navigationButton: Colors.grey2,
  navigationButtonHover: Colors.grey3,
  sections: {
    pink: {
      primary: Colors.pink,
      secondary: Colors.pink,
    },
    blue: {
      primary: Colors.midBlue,
      secondary: Colors.lighterMidBlue,
    },
    orange: {
      primary: Colors.orange,
      secondary: Colors.orange,
    },
    yellow: {
      primary: Colors.yellow,
      secondary: Colors.weirdYellow,
    },
    lightblue: {
      primary: Colors.lightblue,
      secondary: Colors.lighterMidBlue,
    },
    purple: {
      primary: Colors.purple,
      secondary: Colors.purple,
    },
  },
};
