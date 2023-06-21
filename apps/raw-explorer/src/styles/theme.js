// https://www.styled-components.com/docs/advanced#theming
// put color definitions, and other re-usable css stuff here.

const cogsColor = (name) => `var(--cogs-${name})`;

const textGrey = cogsColor('text-color');
const midBlue = cogsColor('midblue');
const lighterMidBlue = cogsColor('midblue-6');
const grey2 = cogsColor('surface--strong');
const grey3 = cogsColor('border--interactive--default');
const grey4 = cogsColor('greyscale-grey4');
const grey5 = cogsColor('text-icon--interactive--disabled');
const grey6 = cogsColor('text-icon--strong');
const grey7 = cogsColor('text-icon--medium');
const weirdYellow = cogsColor('yellow-2');
const successGreen = cogsColor('success');
const dangerRed = cogsColor('danger');
export default {
  backgroundColor: grey2,
  actionText: midBlue,
  textColor: textGrey,
  borderColor: grey2,
  primaryBorder: midBlue,
  primaryBackground: midBlue,
  pillBackground: lighterMidBlue,
  titleOrnamentColor: midBlue,
  accentColor: weirdYellow,
  breadcrumbsText: grey6,
  breadcrumbsBackground: grey3,
  subtitleColor: grey7,
  specificTitleOrnamentColor: midBlue,
  subtleAction: grey6,
  noStatusColor: weirdYellow,
  successColor: successGreen,
  disabledColor: grey4,
  blandColor: grey5,
  dangerColor: dangerRed,
  navigationButton: grey2,
  navigationButtonHover: grey3,
  sections: {
    pink: {
      primary: cogsColor('pink'),
      secondary: cogsColor('pink-6'),
    },
    blue: {
      primary: cogsColor('midblue'),
      secondary: cogsColor('midblue-6'),
    },
    orange: {
      primary: cogsColor('midorange'),
      secondary: cogsColor('midorange-6'),
    },
    yellow: {
      primary: cogsColor('yellow'),
      secondary: cogsColor('yellow-6'),
    },
    lightblue: {
      primary: cogsColor('lightblue'),
      secondary: cogsColor('lightblue-6'),
    },
    purple: {
      primary: cogsColor('purple'),
      secondary: cogsColor('purple-6'),
    },
  },
};
