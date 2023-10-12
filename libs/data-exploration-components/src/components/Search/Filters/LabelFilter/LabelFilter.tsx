import React from 'react';
import { OptionsType, OptionTypeBase } from 'react-select';

import { Body, Tooltip } from '@cognite/cogs.js';
import { LabelDefinition } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';

import { useTranslation } from '@data-exploration-lib/core';

import { ResourceType } from '../../../../types';
import { MultiSelect } from '../../../Select/MultiSelect';

export const LabelFilter = ({
  resourceType,
  value,
  setValue,
}: {
  resourceType: ResourceType;
  value: { externalId: string }[] | undefined;
  setValue: (newValue: { externalId: string }[] | undefined) => void;
}) => {
  const { t } = useTranslation();

  const allowLabels = resourceType === 'asset' || resourceType === 'file';
  const { data: labels = [], isError } = useList<LabelDefinition>(
    'labels',
    { filter: {}, limit: 1000 },
    undefined,
    true
  );

  const currentLabels = (value || [])
    .map(({ externalId }) => labels.find((el) => el.externalId === externalId))
    .filter((el) => !!el) as LabelDefinition[];

  const setLabel = (ids?: string[]) => {
    const newFilters =
      ids && ids.length > 0
        ? ids.map((externalId) => ({ externalId }))
        : undefined;
    setValue(newFilters);
  };

  return (
    <Tooltip
      interactive
      disabled={!isError}
      content={t(
        'PERMISSIONS_ERROR_FETCHING',
        'Error fetching labels, please make sure you have labelsAcl:READ',
        {
          dataType: 'labels',
          permissionType: 'labelsAcl:READ',
        }
      )}
    >
      <>
        <Body
          level={4}
          style={{ marginBottom: 5, marginTop: 10 }}
          className="title"
        >
          Labels
        </Body>
        <MultiSelect
          options={labels.map((el) => ({
            label: el.name,
            value: el.externalId,
          }))}
          isDisabled={isError || !allowLabels}
          onChange={(newValue) => {
            setLabel(
              newValue
                ? (newValue as OptionsType<OptionTypeBase>).map(
                    (el) => el.value
                  )
                : undefined
            );
          }}
          value={currentLabels?.map((el) => ({
            label: el.name,
            value: el.externalId,
          }))}
          isMulti
          isSearchable
          isClearable
        />
      </>
    </Tooltip>
  );
};
