import React, { ChangeEvent, useState } from 'react';
import { Drawer, Input } from '@cognite/cogs.js';
import useSelector from 'hooks/useSelector';
import useDispatch from 'hooks/useDispatch';
import collectionsSlice from 'reducers/collections';
import { selectCollectionsVisibility } from 'reducers/collections/selectors';

const Search = () => {
  const dispatch = useDispatch();
  const isVisible = useSelector(selectCollectionsVisibility);
  const [searchInputValue, setSearchInputValue] = useState('');

  const handleCancel = () => {
    dispatch(collectionsSlice.actions.hideCollections());
  };

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchInputValue(value);
  };

  return (
    <Drawer
      visible={isVisible}
      title="Collections"
      width={500}
      placement="left"
      footer={null}
      onCancel={handleCancel}
    >
      <Input
        fullWidth
        icon="Search"
        placeholder="Find collections and items"
        value={searchInputValue}
        onChange={handleSearchInputChange}
      />
    </Drawer>
  );
};

export default Search;
