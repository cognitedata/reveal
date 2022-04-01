import { useState, useEffect } from 'react';
import Checkbox from 'antd/lib/checkbox';
import { Button, Input } from '@cognite/cogs.js';
import { notification } from 'antd';
import Spin from 'antd/lib/spin';
import Menu from 'antd/lib/menu';
import styled from 'styled-components';
import theme from 'styles/theme';
import { FilterDropdownProps } from 'antd/lib/table/interface';

const StickyFooter = styled.div`
  bottom: 0;
  position: sticky;
  display: inline-flex;
  left: 0;
  background: white;
  border-top: 1px solid ${theme.borderColor};
  width: 100%;
`;
const CheckboxGroup = Checkbox.Group;

const SearchableFilters = ({
  filters,
  clearFilters,
  confirm,
  setSelectedKeys,
  selectedKeys,
}: FilterDropdownProps): JSX.Element => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [filterValues, setFilterValues] = useState<any[]>([]);

  useEffect(() => {
    if (filters) {
      setFilterValues(filters);
    }
  }, [filters]);

  useEffect(() => {
    if (filters) {
      if (searchValue === '') {
        setFilterValues(filters);
      } else {
        try {
          setFilterValues(
            filterValues.filter(
              (item) =>
                String(item.value)
                  .toUpperCase()
                  .search(searchValue.toUpperCase()) >= 0 ||
                item.text.toUpperCase().search(searchValue.toUpperCase()) >= 0
            )
          );
        } catch (e) {
          notification.error({ message: 'Invalid search value' });
          setSearchValue('');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  if (clearFilters && confirm) {
    return (
      <div
        style={{
          maxHeight: '400px',
          overflowX: 'hidden',
          overflowY: 'auto',
          maxWidth: '200px',
        }}
      >
        <Input
          style={{
            position: 'sticky',
            top: 0,
            background: 'white',
          }}
          placeholder="Find filter"
          value={searchValue}
          onChange={(e) => setSearchValue(e.currentTarget.value)}
          icon="Search"
        />
        <CheckboxGroup
          value={selectedKeys}
          onChange={(keys) => setSelectedKeys(keys.map((key) => String(key)))}
        >
          <Menu
            selectedKeys={
              selectedKeys && selectedKeys.map((key) => String(key))
            }
          >
            {filterValues.map((filter) => (
              <Menu.Item
                key={String(filter.value)}
                style={{
                  width: '200px',
                  marginBottom: '0px',
                  marginTop: '0px',
                }}
              >
                <Checkbox value={String(filter.value)}>{filter.text}</Checkbox>
                <br />
              </Menu.Item>
            ))}
          </Menu>
        </CheckboxGroup>
        <StickyFooter>
          <Button
            style={{ right: 0, textAlign: 'right', width: '100%' }}
            type="primary"
            onClick={() => confirm()}
          >
            Confirm
          </Button>
          <Button
            type="secondary"
            style={{ float: 'left', textAlign: 'left', width: '100%' }}
            onClick={() => clearFilters()}
          >
            Reset
          </Button>
        </StickyFooter>
      </div>
    );
  }
  return (
    <div>
      <Spin />
    </div>
  );
};

export default SearchableFilters;
