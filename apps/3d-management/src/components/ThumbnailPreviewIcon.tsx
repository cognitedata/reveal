import React, { forwardRef } from 'react';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { IconProps } from '@cognite/cogs.js/dist/Atoms/Icon/Icon';
import { Optional } from 'src/utils/types';

const EyeIcon = styled(Icon)<IconPropsWithOptionalType>`
  line-height: 0;
  cursor: pointer;
  transform: translateY(3px);
`;

type IconPropsWithOptionalType = Optional<IconProps, 'type'>;

export const ThumbnailPreviewIcon = forwardRef<
  HTMLDivElement,
  Omit<IconPropsWithOptionalType, 'ref'>
>((props, forwardedRef) => {
  // eslint-disable-next-line react/prop-types
  const { type = 'Eye', ...rest } = props;
  return <EyeIcon ref={forwardedRef} type={type} {...rest} />;
});
