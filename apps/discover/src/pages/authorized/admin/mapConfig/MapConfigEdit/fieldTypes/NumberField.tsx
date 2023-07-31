import * as React from 'react';

import styled from 'styled-components/macro';

import { NumberInput } from '@cognite/cogs.js';

import { useDebounce } from 'hooks/useDebounce';

import { ShowStatus } from '../ShowStatus';
import { NodeUpdateResponse, SavingFields } from '../useNodeUpdate';

import { SAVE_AFTER_MILLISECONDS, SHOW_STATUS_MILLISECONDS } from './constants';
import { ItemWrapper } from './elements';

// show the number increment/decrement buttons
export const NumberWrapper = styled(ItemWrapper)`
  & .cogs-input-container .input-wrapper {
    position: static !important;
  }
`;

export const NumberField: React.FC<{
  id: string;
  initialValue: number;
  categoryId: readonly [string, string];
  onUpdate: NodeUpdateResponse;
}> = ({ categoryId, id, initialValue, onUpdate }) => {
  const [value, setValue] = React.useState(initialValue);
  const [responseStatus, setResponseStatus] = React.useState<
    boolean | undefined
  >();

  const debouncedSave = useDebounce(async (fields: SavingFields) => {
    const updateResult = await onUpdate(fields);
    setResponseStatus(!('error' in updateResult));

    setTimeout(() => {
      setResponseStatus(undefined);
    }, SHOW_STATUS_MILLISECONDS);
  }, SAVE_AFTER_MILLISECONDS);

  const handleChange = (next: number) => {
    setValue(Number(next));
    debouncedSave({
      id: categoryId,
      key: id,
      value: next,
    });
  };

  return (
    <NumberWrapper>
      <NumberInput
        id={id}
        title={id}
        value={Number(value)}
        variant="noBorder"
        type="number"
        style={{ position: 'static' }}
        setValue={handleChange}
        step={1}
        min={0}
        max={100}
      />
      <ShowStatus status={responseStatus} />
    </NumberWrapper>
  );
};
