import * as React from 'react';

import { MenuFooterButton } from '../MenuFooterButton';

export interface ApplyButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export const ApplyButton: React.FC<ApplyButtonProps> = (props) => {
  return <MenuFooterButton {...props} text="Apply" />;
};
