import { Button, Flex, Input, Select, toast } from '@cognite/cogs.js';
import startCase from 'lodash/startCase';
import { useState, useEffect } from 'react';
import { ShapeAttribute } from 'typings';
import { v4 as uuid } from 'uuid';
import { Timeseries, Asset } from '@cognite/sdk';
import { useAuthContext } from '@cognite/react-container';
import { ResourceAutoComplete } from 'components/ResourceAutoComplete';

import { AttributeFormWrapper } from './elements';

type AttributeFormProps = {
  existingAttribute?: ShapeAttribute;
  defaultAssetExternalId: string;
  onDone: (nextAttribute: ShapeAttribute) => void;
};

export const AttributeForm = ({
  existingAttribute,
  defaultAssetExternalId,
  onDone,
}: AttributeFormProps) => {
  const { client } = useAuthContext();
  const [attribute, setAttribute] = useState(
    existingAttribute ||
      ({
        id: uuid(),
        name: '',
        type: 'ASSET',
        externalId: defaultAssetExternalId || '',
        extractor: 'METADATA',
      } as ShapeAttribute)
  );

  const [selectedResource, setSelectedResource] = useState<
    Asset | Timeseries
  >();

  useEffect(() => {
    if (attribute.externalId) {
      if (attribute.type === 'TIMESERIES') {
        client?.timeseries
          .retrieve([{ externalId: attribute.externalId }])
          .then((res) => setSelectedResource(res[0]));
      }
      if (attribute.type === 'ASSET') {
        client?.assets
          .retrieve([{ externalId: attribute.externalId }])
          .then((res) => setSelectedResource(res[0]));
      }
    }
  }, []);

  const handleChange = (partial: Partial<ShapeAttribute>) =>
    setAttribute((prev) => ({ ...prev, ...partial }));

  const TYPE_OPTIONS = [
    { value: 'TIMESERIES' as typeof attribute.type, label: 'Time Series' },
    { value: 'ASSET' as typeof attribute.type, label: 'Asset' },
  ];

  const renderExtractorSelector = () => {
    if (!selectedResource) return null;

    const OPTIONS: { value?: typeof attribute.extractor; label: string }[] = [
      { value: undefined, label: 'Select a value' },
    ];
    if (attribute.type === 'TIMESERIES') {
      OPTIONS.push({
        value: 'CURRENT_VALUE' as typeof attribute.extractor,
        label: 'Current value',
      });
    }
    if (Object.keys(selectedResource.metadata || {}).length > 0) {
      OPTIONS.push({
        value: 'METADATA' as typeof attribute.extractor,
        label: 'Metadata',
      });
    }

    if (OPTIONS.length === 1) {
      return (
        <div
          style={{ textAlign: 'center', color: 'var(--cogs-text-secondary)' }}
        >
          This asset has value you can use (no metadata nor current value)
        </div>
      );
    }
    return (
      <Select<typeof attribute.extractor>
        value={OPTIONS.find((x) => x.value === attribute.extractor)}
        options={OPTIONS}
        onChange={(type: { value: typeof attribute.extractor }) => {
          handleChange({
            extractor: type.value,
            subExtractor:
              type.value === 'METADATA'
                ? Object.keys(selectedResource.metadata || {})[0]
                : undefined,
          });
        }}
      />
    );
  };

  const renderSubExtractorSelector = () => {
    if (!selectedResource) return null;
    if (attribute.extractor !== 'METADATA') return null;
    const OPTIONS = [
      { value: undefined, label: 'Select a value' },
      ...Object.keys(selectedResource.metadata || {}).map((k) => ({
        value: k,
        label: startCase(k),
      })),
    ];
    return (
      <Select
        value={OPTIONS.find((x) => x.value === attribute.subExtractor)}
        options={OPTIONS}
        onChange={(type: { value: string }) => {
          handleChange({
            subExtractor: type.value,
          });
        }}
      />
    );
  };
  const validateAttribute = (attribute: ShapeAttribute) => {
    if (!attribute.name) return 'Attribute must have a name';
    if (!attribute.externalId) return 'You must select a resource';
    if (!attribute.extractor) return 'You must choose a value of the resource';
    if (attribute.extractor === 'METADATA' && !attribute.subExtractor)
      return 'You must choose a metadata value';
    return true;
  };

  return (
    <AttributeFormWrapper>
      <Flex className="attribute-name-type-inputs">
        <Select<typeof attribute.type>
          className="attribute-type-select"
          value={
            TYPE_OPTIONS.find((x) => x.value === attribute.type) ||
            TYPE_OPTIONS[0]
          }
          options={[
            { value: 'TIMESERIES', label: 'Time Series' },
            { value: 'ASSET', label: 'Asset' },
          ]}
          onChange={(type: { value: typeof attribute.type }) => {
            setSelectedResource(undefined);
            handleChange({
              type: type.value,
              externalId: '',
              extractor: undefined,
              subExtractor: undefined,
            });
          }}
        />
        <Input
          className="attribute-name-input"
          value={attribute.name}
          onChange={(e) => handleChange({ name: e.target.value })}
          placeholder="Attribute name"
        />
      </Flex>
      <ResourceAutoComplete
        value={{
          label: selectedResource?.name,
          value: selectedResource?.externalId,
        }}
        resourceType={attribute.type}
        placeholder={`Search ${startCase(attribute.type.toLowerCase())}`}
        defaultValue={attribute.externalId}
        setSelectedResource={(next) => {
          setSelectedResource(next);
          const nextChange: Partial<ShapeAttribute> = {
            externalId: next.externalId,
            subExtractor: undefined,
          };
          if (
            attribute.type === 'ASSET' &&
            Object.keys(next?.metadata || {}).length > 0
          ) {
            nextChange.extractor = 'METADATA';
          } else if (attribute.type === 'TIMESERIES') {
            nextChange.extractor = 'CURRENT_VALUE';
          } else {
            nextChange.extractor = undefined;
          }
          handleChange(nextChange);
        }}
      />
      {renderExtractorSelector()}
      {renderSubExtractorSelector()}
      <Input
        className="attribute-url-input"
        value={attribute.url}
        onChange={(e) => handleChange({ url: e.target.value })}
        placeholder="URL"
      />
      <Button
        type="primary"
        onClick={() => {
          const nextAttribute = { ...attribute };
          if (
            !attribute.name &&
            attribute.extractor === 'METADATA' &&
            attribute.subExtractor
          ) {
            nextAttribute.name = attribute.subExtractor.replaceAll(' ', '_');
            setAttribute(nextAttribute);
          }
          const error = validateAttribute(nextAttribute);
          if (typeof error === 'string') {
            toast.error(error);
          } else {
            onDone(nextAttribute);
          }
        }}
      >
        Apply
      </Button>
    </AttributeFormWrapper>
  );
};
