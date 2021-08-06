import React, { CSSProperties, FC } from 'react';

export interface DetailsBlockProps {
  title: string;
  children: React.ReactNode;
}

const roundedBoxStyle: CSSProperties = {
  border: '1px solid #D9D9D9',
  boxSizing: 'border-box',
  borderRadius: 6,
  padding: '9px 16px',
};

const DetailsBlock: FC<DetailsBlockProps> = ({ title, children, ...props }) => (
  <div {...props}>
    <h3>{title}</h3>
    <div style={roundedBoxStyle}>
      {children || <span>No info to display</span>}
    </div>
  </div>
);

export default DetailsBlock;
