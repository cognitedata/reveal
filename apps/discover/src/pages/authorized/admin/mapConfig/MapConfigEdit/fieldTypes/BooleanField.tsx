import * as React from 'react';

import { Switch, Body } from '@cognite/cogs.js';

import { useDebounce } from 'hooks/useDebounce';

import { ShowStatus } from '../ShowStatus';
import { NodeUpdateResponse, SavingFields } from '../useNodeUpdate';

import { SAVE_AFTER_MILLISECONDS, SHOW_STATUS_MILLISECONDS } from './constants';
import { ItemWrapper } from './elements';

export const BooleanField: React.FC<{
  id: string;
  initialValue: boolean;
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

  const handleChange = (newValue: boolean) => {
    setValue(newValue);
    debouncedSave({
      id: categoryId,
      key: id,
      value: newValue,
    });
  };

  return (
    <ItemWrapper key={id}>
      <Switch name={id} checked={value} onChange={handleChange}>
        <Body level={3} strong>
          {id}
        </Body>
      </Switch>
      <ShowStatus status={responseStatus} />
    </ItemWrapper>
  );
};
