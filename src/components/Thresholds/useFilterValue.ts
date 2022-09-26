import { ChartThresholdEventFilter } from 'models/chart/types';
import {
  useState,
  useCallback,
  ChangeEventHandler,
  KeyboardEventHandler,
} from 'react';

type FilterHanlderProps = {
  defaultValue?: number;
  filterKey: string;
  onEventFilterUpdate: (diff: Partial<ChartThresholdEventFilter>) => void;
};
export const useFilterValue = ({
  defaultValue,
  filterKey,
  onEventFilterUpdate,
}: FilterHanlderProps): [
  string,
  ChangeEventHandler,
  KeyboardEventHandler<HTMLInputElement>,
  () => void
] => {
  const [filterValue, setFilterValue] = useState<string>(String(defaultValue));

  const handleValueChange = useCallback((event) => {
    setFilterValue(event.target.value);
  }, []);

  const handleValueUpdate = useCallback(() => {
    onEventFilterUpdate({
      [filterKey]: filterValue === '' ? undefined : parseInt(filterValue, 10),
    });
  }, [filterValue, onEventFilterUpdate, filterKey]);

  const handleValueKeyPress = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        handleValueUpdate();
      }
    },
    [handleValueUpdate]
  );

  return [
    filterValue,
    handleValueChange,
    handleValueKeyPress,
    handleValueUpdate,
  ];
};
