import { minMax } from 'utils/minMax';
import layers from 'utils/zindex';

import { Body } from '@cognite/cogs.js';

import { MultiSelect as Select } from 'components/filters';
import { ExtraLabels } from 'components/filters/interfaces';
import { MultiSelect } from 'modules/filterData/types';

import { FILTER_THEME } from '../../../Npt/filters/constants';
import { NdsFooter } from '../../elements';

interface Props {
  title: string;
  allOptions: string[];
  selectedOptions: MultiSelect;
  extraLabels?: ExtraLabels;
  showMinMaxFooter?: boolean;
  onValueChange: (values: string[]) => void;
}

const renderMinMaxFooter = (allOptions: string[]) => {
  const [min, max] = minMax(allOptions.map((n) => Number(n)));

  return () => {
    return (
      <NdsFooter>
        <Body level={2}>
          {min} - least; {max} - most
        </Body>
      </NdsFooter>
    );
  };
};

const menuStyling = {
  menu: (provided: any) => ({ ...provided, zIndex: layers.MENU_DROPDOWN }),
};

export const NdsSelectFilter: React.FC<Props> = ({
  title,
  onValueChange,
  allOptions,
  selectedOptions,
  extraLabels,
  showMinMaxFooter,
}) => {
  return (
    <Select
      title={`${title}:`}
      onValueChange={onValueChange}
      theme={FILTER_THEME}
      options={allOptions}
      extraLabels={extraLabels}
      selectedOptions={selectedOptions}
      placeholder={`0 / ${allOptions.length}`}
      showSelectedItemCount={selectedOptions.length > 1}
      displayValue={`${selectedOptions.length} / ${allOptions.length}`}
      footer={showMinMaxFooter ? renderMinMaxFooter(allOptions) : undefined}
      styles={menuStyling}
      hideClearIndicator
      enableSelectAll
      showCustomCheckbox
    />
  );
};
