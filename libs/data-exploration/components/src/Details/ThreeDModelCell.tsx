import React from 'react';

import groupBy from 'lodash/groupBy';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Button, Dropdown, Flex, Link, Menu } from '@cognite/cogs.js';

import { DASH, useTranslation } from '@data-exploration-lib/core';
import {
  DetailedMapping,
  useDetailedMappingsByAssetIdQuery,
  usePointcloudsByAssetId,
} from '@data-exploration-lib/domain-layer';

import { TimeDisplay } from '../TimeDisplay';

export const ThreeDModelCellLink = ({
  assetId,
  mapping,
}: {
  assetId: number;
  mapping: DetailedMapping;
}) => {
  return (
    <Link
      size="small"
      href={createLink(`/explore/threeD/${mapping.model.id}`, {
        selectedAssetId: assetId,
        revisionId: mapping.revision.id,
      })}
      alignVertically="left"
    >
      {mapping.model.name}
    </Link>
  );
};

export const ThreeDModelCellDropdown = ({
  assetId,
  mappings,
}: {
  assetId: number;
  mappings: DetailedMapping[];
}) => {
  const { t } = useTranslation();
  const mappingGroups = groupBy(
    mappings.sort((a, b) => a.model.name.localeCompare(b.model.name)),
    ({ model }) => model.id
  );
  return (
    <Dropdown
      content={
        <Menu>
          <Menu.Header>{t('MODELS', 'Models')}</Menu.Header>

          {Object.entries(mappingGroups).map(([id, mappingsLocal]) =>
            mappingsLocal.map((mapping) => (
              <Menu.Item
                key={id}
                href={createLink(`/explore/threeD/${id}`, {
                  selectedAssetId: assetId,
                  revisionId: mapping.revision.id,
                })}
              >
                {mapping.model.name} (
                <TimeDisplay
                  value={mapping.revision.createdTime}
                  relative
                />{' '}
                {t('REVISION', 'revision')})
              </Menu.Item>
            ))
          )}
        </Menu>
      }
    >
      <Button
        icon="ChevronDown"
        iconPlacement="right"
        onClick={(e: any) => e.stopPropagation()}
        size="small"
        type="ghost"
      />
    </Dropdown>
  );
};

export const ThreeDModelCell = ({ assetId }: { assetId: number }) => {
  const { data: cadMappings } = useDetailedMappingsByAssetIdQuery(assetId);

  const { data: pcMappings } = usePointcloudsByAssetId(assetId);

  const mappings = (cadMappings ?? []).concat(pcMappings ?? []);

  if (mappings.length === 0) {
    return <>{DASH}</>;
  }

  if (mappings.length === 1) {
    const mapping = mappings[0];
    return <ThreeDModelCellLink assetId={assetId} mapping={mapping} />;
  }

  return (
    <Flex alignItems="center" gap={8}>
      <Body level={2}>{mappings.length} models</Body>
      <ThreeDModelCellDropdown assetId={assetId} mappings={mappings} />
    </Flex>
  );
};
