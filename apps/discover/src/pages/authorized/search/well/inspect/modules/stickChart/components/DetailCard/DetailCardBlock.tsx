import * as React from 'react';

import {
  DetailCardBlockWrapper,
  DetailCardBlockTitle,
  DetailCardBlockValue,
} from './elements';

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
      <DetailCardBlockTitle>{title}</DetailCardBlockTitle>
      <DetailCardBlockValue>{value}</DetailCardBlockValue>
    </DetailCardBlockWrapper>
  );
};
