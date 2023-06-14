import React from 'react';

import { Icon } from '@cognite/cogs.js';

import { BreadcrumbItemWrapper } from './elements';

export const BreadcrumbItem = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <BreadcrumbItemWrapper onClick={onClick}>
      <Icon type="Breadcrumb" />
      {children}
    </BreadcrumbItemWrapper>
  );
};
