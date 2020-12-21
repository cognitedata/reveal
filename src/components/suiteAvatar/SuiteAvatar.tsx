import React from 'react';
import { acronym } from 'utils/acronym';
import { SuiteAvatarContainer, Default, Medium, Large } from './elements';

export type AvatarSize = 'default' | 'medium' | 'large';

interface Props {
  title?: string;
  disabled?: boolean;
  size?: AvatarSize;
  color?: string;
}

// Replace any with proper type
const sizeComponentMap: Record<AvatarSize, any> = {
  default: Default,
  medium: Medium,
  large: Large,
};

const SuiteAvatar: React.FC<Props> = ({
  title,
  disabled,
  color,
  size = 'default',
}: Props) => {
  const avatarSize = sizeComponentMap[size];

  return (
    <SuiteAvatarContainer as={avatarSize} color={color} disabled={disabled}>
      {title && acronym(title)}
    </SuiteAvatarContainer>
  );
};

export default SuiteAvatar;
