// https://www.styled-components.com/docs/advanced#theming
// put color definitions, and other re-usable css stuff here.

const cogsColor = (name: string) => `var(--cogs-${name})`;

export default {
  backgroundColor: cogsColor('greyscale-grey2'),
  actionText: cogsColor('midblue'),
  textColor: cogsColor('text-color'),
  navigationButton: cogsColor('greyscale-grey2'),
  navigationButtonHover: cogsColor('greyscale-grey3'),
};
