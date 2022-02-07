import React from 'react';
import { Icon, IconType } from '@cognite/cogs.js';
import IconContainer from 'components/icons';
import { SpecialIconType } from 'components/icons/IconContainer';

import { CardHeaderWrapper } from './elements';

export type CardHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: IconType | SpecialIconType;
  appendIcon?: IconType;
  onClick?: () => void;
};
const CardHeader = ({
  title,
  subtitle,
  icon,
  appendIcon,
  onClick,
}: CardHeaderProps) => {
  return (
    <CardHeaderWrapper
      style={{
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <IconContainer type={icon} style={{ marginRight: 8 }} />
      <header>
        <h3 className={subtitle ? 'with-subtitle' : ''}>{title}</h3>
        {subtitle && <div className="card-header--subtitle">{subtitle}</div>}
      </header>
      {appendIcon && (
        <Icon className="card-header--appended-icon" type={appendIcon} />
      )}
    </CardHeaderWrapper>
  );
};

export default CardHeader;
