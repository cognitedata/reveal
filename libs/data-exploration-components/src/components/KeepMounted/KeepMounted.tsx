import React from 'react';

interface Props {
  isVisible: boolean;
}
export const KeepMounted: React.FC<Props> = ({ children, isVisible }) => {
  return (
    <div
      style={{
        display: isVisible ? 'initial' : 'none',
        height: '100%',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};
