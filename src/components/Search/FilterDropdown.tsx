import { Checkbox, Menu, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { makeDefaultTranslations } from 'utils/translations';

export const defaultTranslations = makeDefaultTranslations(
  'Filters',
  'Show empty equipment tags',
  'Types of data',
  'Time series',
  'Step time series',
  'String time series',
  'String time series are currently not supported'
);

export type SearchFilterSettings = {
  isShowEmptyChecked: boolean;
  isTimeseriesChecked: boolean;
  isStepChecked?: boolean;
  isStringChecked: boolean;
};

type FilterDropdownProps = {
  settings: SearchFilterSettings;
  onFilterChange: (field: string, val?: boolean) => void;
  translations?: typeof defaultTranslations;
};

const FilterDropdown = ({
  settings,
  onFilterChange,
  translations,
}: FilterDropdownProps) => {
  const t = { ...defaultTranslations, ...translations };

  return (
    <FilterMenu>
      <Menu.Header>{t.Filters}</Menu.Header>
      <Checkbox
        name="showEmpty"
        defaultChecked={settings.isShowEmptyChecked}
        onChange={(val) => onFilterChange('isShowEmptyChecked', val)}
      >
        {t['Show empty equipment tags']}
      </Checkbox>
      <Menu.Divider />
      <Menu.Header>{t['Types of data']}</Menu.Header>
      <Checkbox
        name="ts"
        defaultChecked={settings.isTimeseriesChecked}
        onChange={(val) => onFilterChange('isTimeseriesChecked', val)}
      >
        {t['Time series']}
      </Checkbox>
      <Checkbox
        name="step"
        defaultChecked={settings.isStepChecked}
        onChange={(val) => onFilterChange('isStepChecked', val || undefined)}
      >
        {t['Step time series']}
      </Checkbox>
      <Tooltip content={t['String time series are currently not supported']}>
        <Checkbox name="string" disabled>
          {t['String time series']}
        </Checkbox>
      </Tooltip>
    </FilterMenu>
  );
};

const FilterMenu = styled(Menu)`
  .cogs-checkbox {
    margin: 5px 10px;

    &.disabled {
      color: var(--cogs-greyscale-grey5);
    }
  }
`;

export default FilterDropdown;
