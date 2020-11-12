import React from 'react';
import { SuiteAvatarContainer, Default, Medium, Large } from './elements';

export type AvatarSize = 'default' | 'medium' | 'large';

interface Props {
  title?: string;
  disabled?: boolean;
  size?: AvatarSize;
  color: string;
}

// Replace any with proper type
const sizeComponentMap: Record<AvatarSize, any> = {
  default: Default,
  medium: Medium,
  large: Large,
};

const exclude = ['&', 'and'];

const SuiteAvatar: React.FC<Props> = ({
  title,
  disabled,
  color,
  size = 'default',
}: Props) => {
  const content =
    (title &&
      title
        .trim()
        .split(' ')
        .filter((str) => str !== '' && !exclude.includes(str.toLowerCase()))
        .map((str) => [...str][0].toUpperCase()) // Codepoint-aware first character
        .slice(0, 2) // Limit the number of characters to include
        .join('')) ||
    '';
  const avatarSize = sizeComponentMap[size];

  return (
    <SuiteAvatarContainer as={avatarSize} color={color} disabled={disabled}>
      {content}
    </SuiteAvatarContainer>
  );
};

export default SuiteAvatar;
