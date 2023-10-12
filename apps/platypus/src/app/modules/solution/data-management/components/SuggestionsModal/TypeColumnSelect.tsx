import { useState } from 'react';

import styled from 'styled-components';

import { DataModelTypeDefsType } from '@platypus/platypus-core';
import xor from 'lodash/xor';

import {
  Body,
  Dropdown,
  Flex,
  Icon,
  Input,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';

import { useTranslation } from '../../../../../hooks/useTranslation';

export const TypeColumnSelect = ({
  selected,
  type,
  onChange,
}: {
  selected: string[];
  type: DataModelTypeDefsType;
  onChange: (columns: string[]) => void;
}) => {
  const { t } = useTranslation('TypeColumnSelect');
  const [filter, setFilter] = useState('');
  const options = [
    'externalId',
    ...type.fields
      // only string is supported
      .filter((f) => f.type.name === 'String')
      .map((f) => f.name),
  ];

  return (
    <Wrapper>
      <Dropdown
        appendTo="parent"
        maxWidth="100%"
        content={
          <Menu>
            <Input
              placeholder="Filter"
              variant="noBorder"
              value={filter}
              onChange={(ev) => setFilter(ev.target.value)}
            />
            {options
              .filter((el) => el.toLowerCase().includes(filter.toLowerCase()))
              .map((el) => {
                const isSelected = selected.includes(el);
                return (
                  // only string types are supported
                  <Menu.Item
                    css={{}}
                    key={el}
                    onClick={() => {
                      onChange(xor(selected, [el]));
                    }}
                    style={{
                      color: isSelected
                        ? 'var(--cogs-text-icon--interactive--default)'
                        : 'inherit',
                    }}
                    icon="String"
                    iconPlacement="left"
                  >
                    <Flex alignItems="center" justifyContent="space-between">
                      {el}
                      {isSelected && <Icon type="Checkmark" />}
                    </Flex>
                  </Menu.Item>
                );
              })}
          </Menu>
        }
      >
        <Flex
          style={{
            border: '2px solid var(--cogs-border-default)',
            borderRadius: 'var(--cogs-border-radius--default)',
            padding: '8px 12px',
          }}
          alignItems="center"
          gap={4}
        >
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Body level={2} strong style={{ marginBottom: 4 }}>
              {type.name}
            </Body>
            <Tooltip
              content={selected.join(', ')}
              disabled={selected.length === 0}
            >
              <Flex gap={4} alignItems="center">
                {selected.length === 1 && (
                  <Icon
                    type="String"
                    // style={{
                    //   color: 'var(--cogs-text-icon--medium)',
                    // }}
                  />
                )}
                <Body
                  level={2}
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--cogs-text-icon--medium)',
                  }}
                >
                  {selected.length > 0
                    ? selected.join(', ')
                    : t('empty_field', 'No field')}
                </Body>
              </Flex>
            </Tooltip>
          </div>
          <Icon type="ChevronDown" />
        </Flex>
      </Dropdown>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  /** really stupid, this is the only way to style the tippy :/ */
  div[data-tippy-root] {
    width: 100%;
  }
`;
