import React from 'react';
import { Icon, IconProps } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Optional } from 'utils/types';

const EyeIcon = styled(Icon)`
  line-height: 0;
  cursor: pointer;
  transform: translateY(3px);
`;

// not sure what's wrong with ref type here...
type IconPropsWithOptionalType = Optional<Omit<IconProps, 'ref'>, 'type'>;

export const ThumbnailPreviewIcon = (props: IconPropsWithOptionalType) => {
  const { type = 'EyeShow', ...rest } = props;
  return <EyeIcon type={type} {...rest} />;
};
