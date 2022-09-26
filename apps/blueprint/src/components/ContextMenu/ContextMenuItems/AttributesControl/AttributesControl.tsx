import { Button, Flex, Title } from '@cognite/cogs.js';
import { Asset, Timeseries } from '@cognite/sdk';
import { ResourceAutoComplete } from 'components/ResourceAutoComplete';
import { useState } from 'react';
import { ShapeAttribute } from 'typings';

import { AttributeDisplay } from './AttributesDisplay';
import { AttributeForm } from './AttributesForm';
import { RightWrapper } from './elements';

type AttributesControlProps = {
  attributes: ShapeAttribute[];
  coreAssetExternalId: string;
  onChange: (nextAttributes: ShapeAttribute[]) => void;
  onChangeCoreAsset: (next: Asset) => void;
};

const isAsset = (value: Asset | Timeseries): value is Asset => {
  return (value as Timeseries)?.unit === undefined;
};

const AttributesControl = ({
  attributes,
  coreAssetExternalId,
  onChange,
  onChangeCoreAsset,
}: AttributesControlProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [coreAsset, setCoreAsset] = useState<Asset>();

  return (
    <RightWrapper>
      <Flex style={{ padding: 16 }}>
        <ResourceAutoComplete
          key={coreAssetExternalId}
          resourceType="ASSET"
          defaultValue={coreAssetExternalId}
          value={{
            label: coreAsset?.name,
            value: coreAsset?.externalId,
          }}
          placeholder="Select core asset"
          setSelectedResource={(next) => {
            if (isAsset(next)) {
              onChangeCoreAsset(next);
              setCoreAsset(next);
            }
          }}
        />
      </Flex>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ padding: 16 }}
      >
        <Title level={4}>Attributes</Title>
        <Button
          icon="Add"
          type="ghost"
          onClick={() => {
            setIsAdding(true);
          }}
        >
          Add attribute
        </Button>
      </Flex>
      {attributes?.map((attr) => (
        <AttributeDisplay
          key={attr.id}
          attribute={attr}
          onChange={(next) => {
            onChange(attributes.map((a) => (a.id === next.id ? next : a)));
          }}
          onDelete={() => {
            onChange(attributes.filter((a) => a.id !== attr.id));
          }}
        />
      ))}
      {isAdding && (
        <AttributeForm
          onDone={(next) => {
            onChange([...attributes, next]);
            setIsAdding(false);
          }}
        />
      )}
    </RightWrapper>
  );
};

export default AttributesControl;
