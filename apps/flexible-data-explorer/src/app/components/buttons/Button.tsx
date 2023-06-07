import { ComponentProps } from 'react';

import { Button as DefaultButton } from '@cognite/cogs.js';

import { ButtonEsc } from './ButtonEsc';
import { ButtonFavorite } from './ButtonFavorite';
import { ButtonFullscreen } from './ButtonFullscreen';
import { ButtonOpenIn } from './ButtonOpenIn';

export const Button = (props: ComponentProps<typeof DefaultButton>) => {
  return <DefaultButton {...props} />;
};

Button.Favorite = ButtonFavorite;
Button.Fullscreen = ButtonFullscreen;
Button.OpenIn = ButtonOpenIn;
Button.ButtonEsc = ButtonEsc;
