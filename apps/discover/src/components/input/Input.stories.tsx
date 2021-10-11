import withThemeProvider from 'storybook/utils/themeDecorator';

import { Icons } from '@cognite/cogs.js';

import { Input } from '.';

export default {
  title: 'Components / input',
  component: Input,
  decorators: [withThemeProvider],
};

export const full = () => <Story />;

export const basic = () => (
  <Input label="Obscure text" placeholder="placeholder" />
);

export const withHelperText = () => (
  <Input
    label="With Helpertext"
    placeholder="placeholder"
    helperText="Help me!"
  />
);

export const withError = () => (
  <Input label="Error" placeholder="placeholder" error />
);

export const withErrorAndHelperText = () => (
  <Input
    label="Error with value"
    placeholder="placeholder"
    error
    value="Text Value"
    helperText="Error!!"
  />
);

export const withDisabled = () => (
  <Input
    label="Disabled"
    placeholder="placeholder"
    disabled
    value="Text Value"
  />
);

export const withDisabledAdnHelperText = () => (
  <Input
    label="Disabled with helpertext"
    placeholder="placeholder"
    disabled
    value="Text Value"
    helperText="disabled"
  />
);

export const withIcon = () => (
  <Input label="With icon" value="Text Value" Icon={<Icons.PlusCompact />} />
);

export const withIconToTheRight = () => (
  <Input
    label="With icon (right)"
    value="Text Value"
    iconPosition="end"
    Icon={<Icons.PlusCompact />}
  />
);

const Story = () => {
  return (
    <div>
      <div>
        <Input label="Obscure text" placeholder="placeholder" /> <span />
        <Input
          label="With Helpertext"
          placeholder="placeholder"
          helperText="Help me!"
        />{' '}
        <span />
      </div>
      <div>
        <Input label="Error" placeholder="placeholder" error /> <span />
        <Input
          label="Error with value"
          placeholder="placeholder"
          error
          value="Text Value"
          helperText="Error!!"
        />{' '}
        <span />
      </div>
      <div>
        <Input
          label="Disabled"
          placeholder="placeholder"
          disabled
          value="Text Value"
        />{' '}
        <span />
        <Input
          label="Disabled with helpertext"
          placeholder="placeholder"
          disabled
          value="Text Value"
          helperText="disabled"
        />{' '}
        <span />
      </div>

      <div>
        <Input
          label="With icon"
          value="Text Value"
          Icon={<Icons.PlusCompact />}
        />{' '}
        <span />
        <Input
          label="With icon (right)"
          value="Text Value"
          iconPosition="end"
          Icon={<Icons.PlusCompact />}
        />{' '}
        <span />
        <Input
          label="With icon (right) and helpertext"
          value="Text Value"
          iconPosition="end"
          Icon={<Icons.PlusCompact />}
          helperText="Please do fill in!"
        />{' '}
        <span />
      </div>
    </div>
  );
};
