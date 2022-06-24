import React from 'react';
import { useHistory } from 'react-router-dom';

interface Props {
  tabIndex?: number;
}

export const NavigateBack: React.FC<React.PropsWithChildren<Props>> = ({
  tabIndex,
  children,
}) => {
  const history = useHistory();

  const handleClick = () => {
    history.goBack();
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleClick();
        }
      }}
      role="button"
      tabIndex={tabIndex || 0}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
};
