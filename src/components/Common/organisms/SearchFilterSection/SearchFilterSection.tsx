import React, { useState } from 'react';
import {
  SearchFilterForm,
  SearchFilterTag,
  SearchFilterFormProps,
} from 'components/Common';
import { Button, Dropdown, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
`;

export const SearchFilterSection = ({
  metadata,
  metadataCategory = {},
  filters = {},
  lockedFilters = [],
  setFilters = () => {},
}: SearchFilterFormProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <Wrapper>
      {Object.keys(filters)
        .sort((a, b) => {
          if (lockedFilters.some(el => el === a)) {
            return -1;
          }
          if (lockedFilters.some(el => el === b)) {
            return 1;
          }
          return a.localeCompare(b);
        })
        .map(el => {
          const isLocked = lockedFilters.some(filter => filter === el);
          return (
            <SearchFilterTag
              isLocked={isLocked}
              filter={el}
              value={filters[el]}
              onDeleteClicked={() => {
                const newFilter = { ...filters };
                delete newFilter[el];
                setFilters(newFilter);
              }}
              category={metadataCategory[el]}
            />
          );
        })}
      <Dropdown
        interactive
        visible={visible}
        content={
          <div
            style={{
              background: '#fff',
              width: '480px',
              boxShadow: `0px 0px 16px ${Colors['greyscale-grey3'].hex()}`,
            }}
          >
            <Button
              icon="Close"
              variant="ghost"
              onClick={() => setVisible(false)}
              style={{ float: 'right' }}
            />
            <SearchFilterForm
              metadata={metadata}
              metadataCategory={metadataCategory}
              filters={filters}
              lockedFilters={lockedFilters}
              setFilters={setFilters}
            />
          </div>
        }
      >
        <Button
          icon="Filter"
          style={{ marginBottom: 12 }}
          type="primary"
          onClick={() => setVisible(!visible)}
        >
          Filters ({Object.keys(filters).length})
        </Button>
      </Dropdown>
    </Wrapper>
  );
};
