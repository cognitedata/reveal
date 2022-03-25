import { useEffect } from 'react';
import styled from 'styled-components';
import Radio from 'antd/lib/radio';
import useLocalStorage from 'hooks/useLocalStorage';

interface SelectorFilterProps {
  filterName: string;
  selectionOptions: { name: string; value: string }[];
  setSelection(value: string): void;
  defaultValue: string;
  persistSelection?: boolean;
}

const SelectorWrapper = styled.div`
  text-align: center;
  display: inline-block;
`;

const SelectorFilter = ({
  selectionOptions,
  setSelection,
  defaultValue,
  filterName,
  persistSelection = true,
}: SelectorFilterProps): JSX.Element => {
  const [storageValue, setStorageValue] = useLocalStorage(
    filterName,
    defaultValue
  );

  useEffect(() => {
    if (storageValue && persistSelection) {
      setSelection(storageValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageValue]);

  return (
    <SelectorWrapper>
      <Radio.Group
        onChange={(val: any) =>
          persistSelection
            ? setStorageValue(val.target.value)
            : setSelection(val.target.value)
        }
        defaultValue={storageValue}
      >
        <Radio.Button value="all">All</Radio.Button>
        {selectionOptions &&
          selectionOptions.map((selection) => (
            <Radio.Button key={selection.name} value={selection.value}>
              {selection.name}
            </Radio.Button>
          ))}
      </Radio.Group>
    </SelectorWrapper>
  );
};

export default SelectorFilter;
