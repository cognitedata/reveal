import React, { useState, useEffect } from 'react';
import { Select, message } from 'antd';
import { SelectWrapper } from 'components/Common';
import { Button, Colors, Icon } from '@cognite/cogs.js';
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
  padding: 12px;
  background: #fff;
  min-width: 480px;
  .tags {
    display: flex;
    flex-wrap: wrap;
  }
  .tags .label {
    align-self: center;
    margin-right: 8px;
    margin-bottom: 12px;
    font-weight: 800;
    color: #000;
  }
`;
type TagProps = { isLocked: boolean };
const Tag = styled.div<TagProps>(
  props => css`
    display: inline-flex;
    align-items: center;
    background: ${Colors['midblue-6'].hex()};
    padding: 8px 16px;
    color: #000;
    border-radius: 30px;
    cursor: ${props.isLocked ? 'unset' : 'pointer'};
    margin-right: 8px;
    margin-bottom: 12px;
    transition: 0.3s all;
    word-break: break-all;
    white-space: nowrap;

    .cogs-icon {
      opacity: 0.1;
    }

    .delete {
      margin-right: 6px;
      display: flex;
      opacity: 1;
      transition: 0.3s all;
      height: 16px;
      width: 16px;
    }
    .delete {
      opacity: 0.1;
      margin-left: 12px;
    }
    ${!props.isLocked &&
    css`
      &&:hover {
        box-shadow: 0px 4px 4px ${Colors['greyscale-grey3'].hex()};
      }
      &&:hover .delete {
        opacity: 1;
      }
    `}
  `
);
const SearchFilterItemWrapper = styled.div`
  display: flex;
  margin-bottom: 12px;
  .key,
  .value {
    display: flex;
    margin-right: 4px;
    flex: 1;
    width: 140px;
    overflow: hidden;
    > div {
      flex: 1;
    }
    .ant-select-selection-selected-value {
      max-width: 108px;
    }
  }
  .buttons {
    width: 160px;
    display: flex;
    align-items: stretch;
    > * {
      margin-left: 4px;
    }
  }
`;

const SearchFilterItem = ({
  key,
  metadata,
  categories,
  lockedFilters,
  setFilter,
  onCancel,
  initialKey,
  initialValue,
}: {
  key: string;
  metadata: {
    [key: string]: string[];
  };
  lockedFilters: string[];
  categories: {
    [key: string]: string[];
  };
  setFilter: (selectedKey: string, selectedValue: string) => void;
  onCancel: (shouldDelete: boolean) => void;
  initialKey?: string;
  initialValue?: string;
}) => {
  const [selectedKey, setSelectedKey] = useState<string | undefined>(
    initialKey
  );
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    initialValue
  );
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
  const hasInitialValue = initialKey || initialValue;
  return (
    <SearchFilterItemWrapper key={key}>
      <div className="key">
        <SelectWrapper>
          <Select
            placeholder="Key"
            disabled={!!initialKey}
            showSearch
            dropdownMatchSelectWidth={false}
            dropdownStyle={{ zIndex: 9999 }}
            dropdownMenuStyle={{ zIndex: 9999 }}
            style={{ width: '100%' }}
            value={selectedKey}
            allowClear
            onChange={(value: any) => {
              if (value === undefined) {
                setSelectedKey(value);
              }
            }}
            onSelect={(value: string | undefined) => {
              setSelectedKey(value);
              setSelectedValue(undefined);
            }}
          >
            {Object.keys(categories)
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
                if (category === 'undefined') {
                  return categories[category].map(el => (
                    <Select.Option
                      disabled={lockedFilters.some(filter => filter === el)}
                      key={el}
                    >
                      {el}
                    </Select.Option>
                  ));
                }
                return (
                  <Select.OptGroup label={category}>
                    {categories[category].map(el => (
                      <Select.Option
                        disabled={lockedFilters.some(filter => filter === el)}
                        key={el}
                      >
                        {el}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                );
              })}
          </Select>
        </SelectWrapper>
      </div>
      <div className="value">
        <SelectWrapper>
          <Select
            placeholder="Value"
            showSearch
            dropdownMatchSelectWidth={false}
            style={{ width: '100%' }}
            dropdownStyle={{ zIndex: 9999 }}
            dropdownMenuStyle={{ zIndex: 9999 }}
            disabled={!selectedKey}
            value={selectedValue}
            onSelect={setSelectedValue}
            allowClear
            mode="tags"
            onChange={(value: any) => {
              if (value === undefined || value.length === 0) {
                setSelectedValue(undefined);
              }
            }}
          >
            {selectedKey &&
              metadata[selectedKey].map(el => (
                <Select.Option key={el}>{el}</Select.Option>
              ))}
          </Select>
        </SelectWrapper>
      </div>
      <div className="buttons">
        <Button
          type="primary"
          icon={initialKey && initialValue ? 'Edit' : 'Plus'}
          disabled={!allowEdit}
          onClick={() => {
            if (allowEdit) {
              setFilter(selectedKey!, selectedValue!);
            } else {
              message.error('You must choose a key and a value');
            }
          }}
        />
        <Button icon="Close" onClick={() => onCancel(false)} />
        {hasInitialValue && (
          <Button
            onClick={() => onCancel(true)}
            type="danger"
            icon="Delete"
            disabled={!hasInitialValue}
          />
        )}
      </div>
    </SearchFilterItemWrapper>
  );
};

export const SearchFilterTag = ({
  isLocked = false,
  onClick = () => {},
  onDeleteClicked = () => {},
  category,
  filter,
  value,
}: {
  isLocked?: boolean;
  onClick?: () => void;
  onDeleteClicked?: () => void;
  category?: string;
  filter: string;
  value: string;
}) => {
  return (
    <Tag isLocked={isLocked} onClick={onClick}>
      {isLocked && LOCKSVG}
      <strong>
        {category && `${category}: `}
        {filter}
      </strong>
      : {value}
      {!isLocked && onDeleteClicked && (
        <Icon
          type="Delete"
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

export type SearchFilterFormProps = {
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

export const SearchFilterForm = ({
  metadata,
  metadataCategory = {},
  filters = {},
  lockedFilters = [],
  setFilters = () => {},
}: SearchFilterFormProps) => {
  const [editingKeys, setEditingKeys] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);

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
      <div className="tags">
        <span className="label">Filters</span>
        {Object.keys(filters).map(el => {
          const isLocked = lockedFilters.some(filter => filter === el);
          return (
            <SearchFilterTag
              isLocked={isLocked}
              filter={el}
              value={filters[el]}
              onClick={() => {
                if (!isLocked) {
                  setEditingKeys(Array.from(new Set(editingKeys).add(el)));
                }
              }}
              onDeleteClicked={() => {
                const newFilter = { ...filters };
                delete newFilter[el];
                setFilters(newFilter);
              }}
              category={metadataCategory[el]}
            />
          );
        })}
      </div>
      {Object.keys(filters)
        .filter(el => editingKeys.includes(el))
        .map(key => (
          <SearchFilterItem
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
      {isAdding && (
        <SearchFilterItem
          key="add"
          metadata={metadata}
          categories={categories}
          lockedFilters={lockedFilters}
          setFilter={(newKey, newValue) => {
            setFilters({ ...filters, [newKey]: newValue });
            setIsAdding(false);
          }}
          onCancel={() => {
            setIsAdding(false);
          }}
        />
      )}
      <Button disabled={isAdding} onClick={() => setIsAdding(true)} icon="Plus">
        Add New Filter
      </Button>
    </Wrapper>
  );
};
