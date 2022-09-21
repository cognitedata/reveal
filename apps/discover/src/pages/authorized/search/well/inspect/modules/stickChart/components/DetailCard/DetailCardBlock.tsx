import * as React from 'react';

import isString from 'lodash/isString';

import { DetailCardBlockInfo } from './DetailCardBlockInfo';
import {
  DetailCardBlockWrapper,
  DetailCardBlockTitle,
  DetailCardBlockValue,
  Avatar,
  InfoContentWrapper,
  DetailsWrapper,
} from './elements';

export interface DetailBlockProps {
  title: string;
  value?: string | number;
  avatarColor?: string;
  info?: string | JSX.Element;
  extended?: boolean;
}

export const DetailCardBlock: React.FC<DetailBlockProps> = ({
  title,
  value = '-',
  avatarColor,
  info,
  extended = false,
}) => {
  const renderInfo = () => {
    if (isString(info)) {
      return <DetailCardBlockInfo info={info} />;
    }
    return info;
  };

  return (
    <DetailCardBlockWrapper $extended={extended}>
      {avatarColor && <Avatar color={avatarColor} />}

      <DetailsWrapper>
        <DetailCardBlockTitle>{title}</DetailCardBlockTitle>
        <DetailCardBlockValue>{value}</DetailCardBlockValue>
      </DetailsWrapper>

      {info && <InfoContentWrapper>{renderInfo()}</InfoContentWrapper>}
    </DetailCardBlockWrapper>
  );
};
