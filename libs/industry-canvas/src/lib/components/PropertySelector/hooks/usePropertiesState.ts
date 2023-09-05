import { useCallback, useMemo, useState } from 'react';
import { DropResult, OnDragEndResponder } from 'react-beautiful-dnd';

import { Property } from '../types';
import { reorder } from '../utils';

const usePropertiesState = (
  initialProperties: Property[],
  searchInput: string
): {
  properties: Property[];
  filteredProperties: Property[];
  onDragEnd: OnDragEndResponder;
  onSelect: (path: string) => void;
} => {
  const [properties, setProperties] = useState(initialProperties);

  const filteredProperties = useMemo(
    () =>
      properties.filter((property) =>
        property.path.toLowerCase().includes(searchInput.toLowerCase())
      ),
    [properties, searchInput]
  );

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;
    if (destination === null || destination === undefined) {
      return;
    }

    if (destination.index === source.index) {
      return;
    }

    setProperties((prevProperties) =>
      reorder(prevProperties, source.index, destination.index)
    );
  }, []);

  const onSelect = useCallback((path: string) => {
    setProperties((prevState) =>
      prevState.map((prevProperty) => {
        if (prevProperty.path === path) {
          return {
            ...prevProperty,
            isSelected: !prevProperty.isSelected,
          };
        }
        return prevProperty;
      })
    );
  }, []);

  return {
    properties,
    filteredProperties,
    onDragEnd,
    onSelect,
  };
};

export default usePropertiesState;
