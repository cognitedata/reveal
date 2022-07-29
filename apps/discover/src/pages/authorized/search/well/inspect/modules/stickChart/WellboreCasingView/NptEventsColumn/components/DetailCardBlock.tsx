import React from 'react';

import { DetailCardBlockWrapper, Title, Value } from '../elements';

export interface DetailBlockProps {
  title: string;
  value?: string | number;
}

export const DetailCardBlock: React.FC<DetailBlockProps> = ({
  title,
  value,
}) => {
  return (
    <DetailCardBlockWrapper>
      <Title>{title}</Title>
      <Value>{value}</Value>
    </DetailCardBlockWrapper>
  );
};
