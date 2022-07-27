import * as React from 'react';

import { Input } from '@cognite/cogs.js';

import { useDebounce } from 'hooks/useDebounce';

import { ShowStatus } from '../ShowStatus';
import { NodeUpdateResponse, SavingFields } from '../useNodeUpdate';

import { SAVE_AFTER_MILLISECONDS, SHOW_STATUS_MILLISECONDS } from './constants';
import { ItemWrapper } from './elements';

export const InputField: React.FC<{
  id: string;
  initialValue: string;
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    debouncedSave({
      id: categoryId,
      key: event.target.id,
      value: newValue,
    });
  };

  return (
    <ItemWrapper>
      <Input
        id={id}
        title={id}
        value={value}
        variant="noBorder"
        style={{ marginRight: '16px' }}
        onChange={handleChange}
      />
      <ShowStatus status={responseStatus} />
    </ItemWrapper>
  );
};
