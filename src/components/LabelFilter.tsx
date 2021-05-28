import React from 'react';
import { Tooltip, Select } from '@cognite/cogs.js';
import { LabelDefinition } from '@cognite/sdk';
import { useList, usePermissions } from '@cognite/sdk-react-query-hooks';

export const LabelFilter = ({
  value,
  setValue,
}: {
  value: { externalId: string }[] | undefined;
  setValue: (newValue: { externalId: string }[] | undefined) => void;
}) => {
  const { data: hasPermission } = usePermissions('labelsAcl', 'READ');
  const { data: labels = [] } = useList<LabelDefinition>(
    'labels',
    { filter: {}, limit: 1000 },
    {
      enabled: hasPermission,
    },
    true
  );

  const currentLabels = (value || [])
    .map(({ externalId }) => labels.find((el) => el.externalId === externalId))
    .filter((el) => !!el) as LabelDefinition[];

  const setLabel = (ids?: string[]) => {
    const newFilters = ids?.length
      ? ids.map((externalId) => ({ externalId }))
      : undefined;
    setValue(newFilters);
  };

  return (
    <Tooltip
      interactive
      disabled={hasPermission}
      content="You do not have access to labels, please make sure you have labelsAcl:READ"
    >
      <div
        style={{
          minWidth: '250px',
          cursor: !hasPermission ? 'not-allowed' : 'pointer',
        }}
      >
        <Select
          placeholder=""
          title="Labels"
          options={labels.map((el) => ({
            label: el.name,
            value: el.externalId,
          }))}
          isDisabled={!hasPermission}
          onChange={(newValue: { value: string }[]) => {
            setLabel(newValue?.map((el: { value: string }) => el.value));
          }}
          value={currentLabels?.map((el) => ({
            label: el.name,
            value: el.externalId,
          }))}
          isMulti
          isSearchable
          isClearable
        />
      </div>
    </Tooltip>
  );
};
