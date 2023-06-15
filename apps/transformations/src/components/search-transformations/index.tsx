import { useTranslation } from '@transformations/common';
import { getTrackEvent } from '@transformations/utils';
import { Input } from 'antd';

import { trackEvent } from '@cognite/cdf-route-tracker';

export type SearchProps = {
  value: string;
  placeHolder?: string;
  onChange: (value: string | undefined) => void;
};

export const SearchTransformations = (props: SearchProps): JSX.Element => {
  const { t } = useTranslation();
  const { value, placeHolder = t('search'), onChange } = props;

  const searchInputChangeHandler = (event: any) => {
    const searchText = event?.target?.value;
    onChange(searchText);
  };

  return (
    <Input
      placeholder={placeHolder}
      onChange={searchInputChangeHandler}
      onBlur={() => {
        if (value) {
          trackEvent(getTrackEvent('event-tr-list-search-on-blur-click'));
        }
      }}
      value={value}
    />
  );
};

export default SearchTransformations;
