import { Dropdown, Menu, Detail } from '@cognite/cogs.js-v9';
import { useState } from 'react';
import {
  BenchmarkingTypeFilterButton,
  BenchmarkingTypeFilterDropdown,
  MenuItem,
} from 'components/BenchmarkingTypeFilter/elements';
import { BenchmarkingWaterCourses } from '@cognite/power-ops-api-types';
import { BenchmarkingTypeOption as BenchmarkingTypeFilterOption } from 'types';

type Props = {
  value: BenchmarkingTypeFilterOption | undefined;
  filterOptions: BenchmarkingWaterCourses['methods'];
  onChange: (value: BenchmarkingTypeFilterOption) => void;
};

export const BenchmarkingTypeSelect = ({
  value,
  filterOptions,
  onChange,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [dropDownInstance, setDropDownInstance] = useState<any>();

  return (
    <BenchmarkingTypeFilterDropdown>
      <Dropdown
        className="benchmarking-type-dropdown"
        onClickOutside={() => {
          dropDownInstance?.hide();
        }}
        onMount={(instance) => {
          setDropDownInstance(instance);
        }}
        onHide={() => setOpen(false)}
        content={
          <Menu>
            <Menu.Item
              toggled={value === 'absolute'}
              onClick={() => {
                onChange('absolute');
                dropDownInstance?.hide();
              }}
              css={{}}
            >
              Absolute
            </Menu.Item>
            <Menu.Submenu
              content={
                <Menu>
                  <Detail>Baseline method</Detail>
                  {filterOptions.map((method) => {
                    return (
                      <Menu.Item
                        toggled={value === method.value}
                        key={method.value}
                        onClick={() => {
                          onChange(method.value);
                          dropDownInstance?.hide();
                        }}
                        css={{}}
                      >
                        {method.label}
                      </Menu.Item>
                    );
                  })}
                </Menu>
              }
            >
              <MenuItem
                aria-selected={value !== 'absolute'}
                aria-label="Difference"
                onClick={() => {
                  setOpen(!open);
                  dropDownInstance?.hide();
                }}
              >
                <div>
                  Difference
                  {value !== 'absolute' && (
                    <p>
                      {filterOptions.find((method) => method.label === value)
                        ?.label || value}
                    </p>
                  )}
                </div>
              </MenuItem>
            </Menu.Submenu>
          </Menu>
        }
      >
        <BenchmarkingTypeFilterButton
          theme="grey"
          title="Type:"
          value={
            value !== 'absolute'
              ? {
                  value: `Difference - ${value}`,
                  label: `Difference - ${value}`,
                }
              : { value: 'Absolute', label: 'Absolute' }
          }
          disableTyping
          onClick={() => setOpen(!open)}
        />
      </Dropdown>
    </BenchmarkingTypeFilterDropdown>
  );
};
