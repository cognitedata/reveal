import * as React from 'react';

import isArray from 'lodash/isArray';
import layers from 'utils/zindex';

import { MultiSelectGroup } from 'components/Filters/MultiSelect/MultiSelectGroup';
import {
  WellFilterOption,
  WellFilterOptionValue,
} from 'modules/wellSearch/types';

import { MultiSelectWrapper } from './elements';

export type Props = {
  onValueChange: (filterId: number, value: any) => void;
  groupedOptions?: {
    label: string;
    options: (WellFilterOption | WellFilterOptionValue)[];
  }[];
  selectedOptions: string | WellFilterOptionValue[];
  title: string;
  isTextCapitalized?: boolean;
  filterId: number;
  footer?: () => React.ReactElement;
};

export const MultiSelectGroupElement: React.FC<Props> = React.memo(
  ({
    onValueChange,
    groupedOptions,
    selectedOptions,
    title,
    isTextCapitalized,
    filterId,
    footer,
  }: Props) => {
    return (
      <MultiSelectWrapper>
        <MultiSelectGroup
          groupedOptions={groupedOptions}
          selectedOptions={
            isArray(selectedOptions) ? selectedOptions : [selectedOptions]
          }
          title={title}
          titlePlacement="top"
          onValueChange={(values: string[]) => onValueChange(filterId, values)}
          isTextCapitalized={isTextCapitalized}
          footer={footer}
          styles={{
            groupHeading: (base: any) => ({
              ...base,
              textTransform: 'inherit',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: layers.FILTER_HEADER,
            }),
          }}
        />
      </MultiSelectWrapper>
    );
  }
);
