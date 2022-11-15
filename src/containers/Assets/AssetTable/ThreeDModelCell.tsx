import React from 'react';
import { Asset } from '@cognite/sdk';
import { A, Body, Button, Dropdown, Flex, Menu } from '@cognite/cogs.js';
import { RelationshipLabels } from 'types';

export type AssetWithRelationshipLabels = RelationshipLabels & Asset;

import {
  DetailedMapping,
  useDetailedMappingsByAssetIdQuery,
} from 'domain/threeD';
import { createLink } from '@cognite/cdf-utilities';
import { DASH } from '../../../utils';

export const ThreeDModelCellLink = ({
  assetId,
  mapping,
}: {
  assetId: number;
  mapping: DetailedMapping;
}) => {
  return (
    <A
      href={createLink(`/explore/threeD/${mapping.model.id}`, {
        selectedAssetId: assetId,
      })}
      onClick={e => e.stopPropagation()}
      as="a"
    >
      {mapping.model.name}
    </A>
  );
};

export const ThreeDModelCellDropdown = ({
  assetId,
  mappings,
}: {
  assetId: number;
  mappings: DetailedMapping[];
}) => {
  return (
    <Dropdown
      content={
        <Menu onClick={e => e.stopPropagation()}>
          <Menu.Header>Models</Menu.Header>
          {mappings.map(mapping => (
            <Menu.Item
              key={mapping.model.id}
              href={createLink(`/explore/threeD/${mapping.model.id}`, {
                selectedAssetId: assetId,
              })}
            >
              {mapping.model.name}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <Button
        icon="ChevronDown"
        iconPlacement="right"
        onClick={e => e.stopPropagation()}
        size="small"
        type="ghost"
      />
    </Dropdown>
  );
};

export const ThreeDModelCell = ({ assetId }: { assetId: number }) => {
  const { data: mappings, isFetched } =
    useDetailedMappingsByAssetIdQuery(assetId);

  if (!isFetched || !mappings?.length) {
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
