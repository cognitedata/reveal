import React, { CSSProperties, FC } from 'react';

export interface DetailsBlockProps {
  title: string;
  children: React.ReactNode;
  style?: CSSProperties;
}

const roundedBoxStyle: CSSProperties = {
  border: '1px solid #D9D9D9',
  boxSizing: 'border-box',
  borderRadius: 6,
  padding: '8px',
};

const mainDivStyle: CSSProperties = {
  margin: '8px 0',
};

const DetailsBlock: FC<DetailsBlockProps> = ({
  title,
  children,
  style,
  ...props
}) => (
  <div style={{ ...mainDivStyle, ...style }} {...props}>
    <h4>{title}</h4>
    <div style={roundedBoxStyle}>
      {children || <span>No info to display</span>}
    </div>
  </div>
);

export default DetailsBlock;
