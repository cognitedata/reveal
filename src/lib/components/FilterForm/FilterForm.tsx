import React, { useState, useEffect } from 'react';
import { Select, SpacedRow } from 'lib/components';
import { Button, Colors, Icon, Tooltip } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';

const LOCKSVG = (
  <svg
    style={{ marginRight: 8 }}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.75 4.5H8.125V3.35714C8.125 1.78 6.725 0.5 5 0.5C3.275 0.5 1.875 1.78 1.875 3.35714V4.5H1.25C0.5625 4.5 0 5.01429 0 5.64286V11.3571C0 11.9857 0.5625 12.5 1.25 12.5H8.75C9.4375 12.5 10 11.9857 10 11.3571V5.64286C10 5.01429 9.4375 4.5 8.75 4.5ZM5 9.64286C4.3125 9.64286 3.75 9.12857 3.75 8.5C3.75 7.87143 4.3125 7.35714 5 7.35714C5.6875 7.35714 6.25 7.87143 6.25 8.5C6.25 9.12857 5.6875 9.64286 5 9.64286ZM6.9375 4.5H3.0625V3.35714C3.0625 2.38 3.93125 1.58571 5 1.58571C6.06875 1.58571 6.9375 2.38 6.9375 3.35714V4.5Z"
      fill="#404040"
    />
  </svg>
);

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
`;

type TagProps = { isLocked: boolean };
const Tag = styled.div<TagProps>(
  props => css`
    display: inline-flex;
    align-items: center;
    background: ${Colors['midblue-6'].hex()};
    padding: 8px 16px;
    color: ${Colors['midblue-2'].hex()};
    font-weight: 600;
    border-radius: 30px;
    cursor: ${props.isLocked ? 'unset' : 'pointer'};
    margin-right: 8px;
    margin-bottom: 12px;
    transition: 0.3s all;
    word-break: break-all;
    white-space: nowrap;
    max-width: 100%;

    .cogs-icon {
      opacity: 0.1;
      flex-shrink: 0;
    }

    .delete {
      margin-right: 6px;
      margin-left: 12px;
      display: flex;
      opacity: 0.5;
      transition: 0.3s all;
      color: ${Colors.danger.hex()};
      height: 16px;
      width: 16px;
    }

    span {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    ${!props.isLocked &&
    css`
      .delete:hover {
        opacity: 1;
      }
    `}
  `
);

const FilterItemWrapper = styled.div`
  margin-bottom: 12px;
  .key {
    margin-bottom: 16px;
  }
  .key,
  .value {
    display: flex;
    margin-right: 4px;
    flex: 1;
    > div {
      flex: 1;
    }
  }
  .buttons {
    display: flex;
    align-items: stretch;
    > * {
      margin-left: 4px;
    }
  }
`;

const ButtonGroupWrapper = styled(SpacedRow)`
  margin: 0 4px 8px auto;
`;

const FilterItem = ({
  metadata,
  categories,
  lockedFilters,
  setFilter,
  onCancel,
  initialKey,
  initialValue,
}: {
  metadata: {
    [key: string]: string[];
  };
  lockedFilters: string[];
  categories: {
    [key: string]: string[];
  };
  setFilter: (selectedKey: string, selectedValue: string) => void;
  onCancel?: (shouldDelete: boolean) => void;
  initialKey?: string;
  initialValue?: string;
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  useEffect(() => {
    if (initialKey) {
      setSelectedKey(initialKey);
    }
  }, [initialKey]);
  useEffect(() => {
    if (initialValue) {
      setSelectedValue(initialValue);
    }
  }, [initialValue]);

  const allowEdit =
    selectedKey &&
    selectedValue &&
    (selectedKey !== initialKey || selectedValue !== initialValue);
  return (
    <>
      <FilterItemWrapper>
        <div className="key">
          <Select<{
            label: string;
            value: string;
            disabled?: boolean;
          }>
            creatable
            styles={{
              menu: style => ({
                ...style,
                width: '100%',
                maxWidth: '320px',
              }),
            }}
            placeholder="Key"
            disabled={!!initialKey}
            value={
              selectedKey ? { label: selectedKey, value: selectedKey } : null
            }
            onChange={item => {
              if (item === undefined) {
                setSelectedKey(null);
              } else {
                setSelectedKey(
                  (item as {
                    value: string;
                  })?.value
                );
              }
              setSelectedValue(null);
            }}
            options={Object.keys(categories)
              .sort((a, b) => {
                if (a === 'undefined') {
                  return -1;
                }
                if (b === 'undefined') {
                  return 1;
                }
                return a.localeCompare(b);
              })
              .map(category => {
                return {
                  label: category,
                  options: categories[category].map(el => ({
                    label: el,
                    value: el,
                    disabled: lockedFilters.includes(el),
                  })),
                };
              })}
          />
        </div>
        <div className="value">
          <Select<{
            label: string;
            value: string;
            disabled?: boolean;
          }>
            creatable
            styles={{
              menu: style => ({
                ...style,
                width: '100%',
                maxWidth: '320px',
              }),
            }}
            placeholder="Value"
            disabled={!selectedKey}
            value={
              selectedValue
                ? { label: selectedValue, value: selectedValue }
                : null
            }
            onChange={item => {
              if (item === undefined) {
                setSelectedValue(null);
              } else {
                setSelectedValue((item as { value: string })?.value);
              }
            }}
            options={
              selectedKey
                ? metadata[selectedKey]?.map(el => ({ label: el, value: el }))
                : []
            }
          />
        </div>
      </FilterItemWrapper>
      {allowEdit && (
        <ButtonGroupWrapper>
          <Button
            onClick={() => {
              if (onCancel) {
                onCancel(false);
              }
              setSelectedKey(null);
              setSelectedValue(null);
            }}
          >
            Clear
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setFilter(selectedKey!, selectedValue!);
              setSelectedKey(null);
              setSelectedValue(null);
            }}
          >
            Apply
          </Button>
        </ButtonGroupWrapper>
      )}
    </>
  );
};

export const FilterTag = ({
  isLocked = false,
  onClick = () => {},
  onDeleteClicked = () => {},
  filter,
  value,
}: {
  isLocked?: boolean;
  onClick?: () => void;
  onDeleteClicked?: () => void;
  filter: string;
  value: string;
}) => {
  return (
    <Tag isLocked={isLocked} onClick={onClick}>
      {isLocked && LOCKSVG}
      <Tooltip interactive content={`${filter}: ${value}`}>
        <span>
          {filter}: {value}
        </span>
      </Tooltip>
      {!isLocked && onDeleteClicked && (
        <Icon
          type="Close"
          className="delete"
          onClick={ev => {
            ev.stopPropagation();
            onDeleteClicked();
          }}
        />
      )}
    </Tag>
  );
};

export type FilterFormProps = {
  metadata: {
    [key: string]: string[];
  };
  filters?: {
    [key: string]: string;
  };
  metadataCategory?: {
    [key: string]: string;
  };
  lockedFilters?: string[];
  setFilters: (filter: { [key: string]: string }) => void;
};

export const FilterForm = ({
  metadata,
  metadataCategory = {},
  filters = {},
  lockedFilters = [],
  setFilters = () => {},
}: FilterFormProps) => {
  const [editingKeys, setEditingKeys] = useState<string[]>([]);

  const allKeys = new Set<string>();
  Object.keys(metadataCategory).forEach(el => allKeys.add(el));
  Object.keys(metadata).forEach(el => allKeys.add(el));

  const categories = [...allKeys].reduce((prev, el) => {
    if (!prev[metadataCategory[el]]) {
      prev[metadataCategory[el] || 'undefined'] = [] as string[];
    }
    prev[metadataCategory[el] || 'undefined'].push(el);
    return prev;
  }, {} as { [key: string]: string[] });
  return (
    <Wrapper>
      {Object.keys(filters)
        .filter(el => editingKeys.includes(el))
        .map(key => (
          <FilterItem
            key={key}
            categories={categories}
            lockedFilters={lockedFilters}
            metadata={metadata}
            initialKey={key}
            initialValue={filters[key]}
            setFilter={(newKey, newValue) => {
              setFilters({ ...filters, [newKey]: newValue });
              setEditingKeys(editingKeys.filter(el => el !== key));
            }}
            onCancel={shouldDelete => {
              if (shouldDelete) {
                const newFilter = { ...filters };
                delete newFilter[key];
                setFilters(newFilter);
              }
              setEditingKeys(editingKeys.filter(el => el !== key));
            }}
          />
        ))}
      <FilterItem
        key="add"
        metadata={metadata}
        categories={categories}
        lockedFilters={lockedFilters}
        setFilter={(newKey, newValue) => {
          setFilters({ ...filters, [newKey]: newValue });
        }}
      />
      <Tags>
        {Object.keys(filters).map(el => {
          const isLocked = lockedFilters.some(filter => filter === el);
          return (
            <FilterTag
              key={el}
              isLocked={isLocked}
              filter={el}
              value={filters[el]}
              onDeleteClicked={() => {
                const newFilter = { ...filters };
                delete newFilter[el];
                setFilters(newFilter);
              }}
            />
          );
        })}
      </Tags>
    </Wrapper>
  );
};
