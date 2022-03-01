import React from 'react';
import { acronym } from 'utils/acronym';

import { SuiteAvatarContainer, Default, Medium, Large } from './elements';
import { types } from './avatarLogo';

export type AvatarSize = 'default' | 'medium' | 'large';

interface Props {
  title?: string;
  disabled?: boolean;
  size?: AvatarSize;
  color?: string;
  logo?: string | null;
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
  logo,
}: Props) => {
  const avatarSize = sizeComponentMap[size];

  const getLogoComponent = () => {
    if (logo && types[logo]) {
      return (
        <SuiteAvatarContainer
          className="suite-avatar"
          as={avatarSize}
          color={color}
          disabled={disabled}
        >
          <img width={24} height={24} src={types[logo]} alt={logo} />
        </SuiteAvatarContainer>
      );
    }

    return (
      <SuiteAvatarContainer
        className="suite-avatar"
        as={avatarSize}
        color={color}
        disabled={disabled}
      >
        {title && acronym(title)}
      </SuiteAvatarContainer>
    );
  };
  return <>{getLogoComponent()}</>;
};

export default SuiteAvatar;
