import { useMemo, useState } from 'react';

import styled, { css } from 'styled-components';

import { useFDM } from '@fdx/shared/providers/FDMProvider';

import { Chip, Divider, Dropdown, Menu } from '@cognite/cogs.js';

import { RESULT_TOGGLE_LIMIT } from './constants';

export const ResultsSelection = () => {
  const client = useFDM();
  const [selected, setSelected] = useState<string[]>([]);

  const fields = useMemo(() => {
    if (!client.allDataTypes) {
      return [];
    }
    return [{ name: 'Time series' }, ...client.allDataTypes];
  }, [client.allDataTypes]);

  // Show first 5 results as chips, the rest as dropdown items.
  const group = fields?.reduce(
    (acc, item) => {
      if (acc.chips.length >= RESULT_TOGGLE_LIMIT) {
        return { ...acc, dropdown: [...acc.dropdown, item.name] };
      }

      return { ...acc, chips: [...acc.chips, item.name] };
    },
    { dropdown: [], chips: [] } as { chips: string[]; dropdown: string[] }
  );

  const handleSelectClick = (item: string) => {
    setSelected((prevState) => {
      if (prevState?.includes(item)) {
        return prevState.filter((name) => name !== item);
      }
      return [...(prevState || []), item];
    });
  };

  return (
    <>
      <StyledChip
        label="All"
        type={!selected.length ? 'neutral' : undefined}
        onClick={() => setSelected([])}
      />
      <Divider direction="vertical" weight="2px" style={{ height: '10px' }} />

      {group?.chips?.map((item) => (
        <StyledChip
          key={item}
          label={item}
          type={selected?.includes(item) ? 'neutral' : undefined}
          onClick={() => {
            handleSelectClick(item);
          }}
        />
      ))}

      {group && group?.dropdown?.length > 0 && (
        <Dropdown
          content={
            <StyledMenu>
              {group?.dropdown.map((item) => (
                <Menu.Item
                  key={item}
                  onClick={() => {
                    handleSelectClick(item);
                  }}
                  style={{
                    background: selected?.includes(item)
                      ? 'var(--cogs-surface--status-neutral--muted--default)'
                      : undefined,
                    color: selected?.includes(item)
                      ? 'var(--cogs-text-icon--status-neutral)'
                      : undefined,
                    marginBottom: '4px',
                  }}
                >
                  {item}
                </Menu.Item>
              ))}
            </StyledMenu>
          }
        >
          <StyledChip
            selected={selected.some((item) => group?.dropdown.includes(item))}
            label={`${group?.dropdown.length}+`}
            icon="ChevronDown"
            iconPlacement="right"
          />
        </Dropdown>
      )}
    </>
  );
};

const StyledChip = styled(Chip).attrs({ size: 'small' })<{
  selected?: boolean;
}>`
  ${({ selected }) =>
    selected &&
    css`
      background: var(
        --cogs-surface--status-neutral--muted--default
      ) !important;
      color: var(--cogs-text-icon--status-neutral) !important;
    `}
`;

const StyledMenu = styled(Menu)`
  max-height: 350px;
  overflow: auto;
`;
