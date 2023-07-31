import * as React from 'react';

import { Option } from '../Option';

const DETAIL_PAGE_OPTION_TEXT = 'Detail page';

export interface DetailPageOptionProps {
  onClick: () => void;
}

export const DetailPageOption: React.FC<DetailPageOptionProps> = ({
  onClick,
}) => {
  return (
    <Option
      key={DETAIL_PAGE_OPTION_TEXT}
      option={DETAIL_PAGE_OPTION_TEXT}
      onChange={onClick}
    />
  );
};
