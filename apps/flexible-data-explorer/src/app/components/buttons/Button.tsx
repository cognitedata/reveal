import { ComponentProps } from 'react';

import { Button as DefaultButton } from '@cognite/cogs.js';

import { ButtonEsc } from './ButtonEsc';
import { ButtonFavorite } from './ButtonFavorite';
import { ButtonFullscreen } from './ButtonFullscreen';
import { ButtonInternalRedirect } from './ButtonInternalRedirect';
import { ButtonOpenIn } from './ButtonOpenIn';
import { ButtonShowMore } from './ButtonShowMore';

export const Button = (props: ComponentProps<typeof DefaultButton>) => {
  return <DefaultButton {...props} />;
};

Button.ButtonEsc = ButtonEsc;
Button.Favorite = ButtonFavorite;
Button.Fullscreen = ButtonFullscreen;
Button.InternalRedirect = ButtonInternalRedirect;
Button.OpenIn = ButtonOpenIn;
Button.ShowMore = ButtonShowMore;
