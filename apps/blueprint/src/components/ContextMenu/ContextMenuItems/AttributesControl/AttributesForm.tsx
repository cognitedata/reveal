import {
  AutoComplete,
  Button,
  Flex,
  Input,
  OptionsType,
  OptionTypeBase,
  Select,
  toast,
} from '@cognite/cogs.js';
import startCase from 'lodash/startCase';
import { useState, useEffect } from 'react';
import { ShapeAttribute } from 'typings';
import { v4 as uuid } from 'uuid';
import { Timeseries, Asset } from '@cognite/sdk';
import { useAuthContext } from '@cognite/react-container';

import { AttributeFormWrapper } from './elements';

type AttributeFormProps = {
  existingAttribute?: ShapeAttribute;
  onDone: (nextAttribute: ShapeAttribute) => void;
};

export const AttributeForm = ({
  existingAttribute,
  onDone,
}: AttributeFormProps) => {
  const { client } = useAuthContext();
  const [attribute, setAttribute] = useState(
    existingAttribute ||
      ({
        id: uuid(),
        name: '',
        type: 'TIMESERIES',
        externalId: '',
        extractor: 'CURRENT_VALUE',
      } as ShapeAttribute)
  );

  const [inputValue, setInputValue] = useState<string>(attribute.externalId);
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

  const handleInputChange = (newValue: string) => {
    const newInputValue = newValue.replace(/\W/g, '');
    setInputValue(newInputValue);
    return newInputValue;
  };

  const loadOptions = (
    input: string,
    callback: (options: OptionsType<OptionTypeBase>) => void
  ) => {
    if (!input) {
      callback([]);
      return;
    }
    if (attribute.type === 'TIMESERIES') {
      client?.timeseries
        .search({ search: { query: input } })
        .then((res) => callback(res.map((r) => ({ label: r.name, value: r }))));
    }
    if (attribute.type === 'ASSET') {
      client?.assets
        .search({ search: { query: input } })
        .then((res) => callback(res.map((r) => ({ label: r.name, value: r }))));
    }
  };

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
            setInputValue('');
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
      <AutoComplete
        key={attribute.type}
        mode="async"
        placeholder={`Search ${startCase(attribute.type)}s`}
        value={{
          value: selectedResource,
          label:
            inputValue ||
            selectedResource?.name ||
            `Search ${startCase(attribute.type.toLowerCase())}s`,
        }}
        loadOptions={loadOptions}
        handleInputChange={handleInputChange}
        onChange={(next: { value: Timeseries | Asset; label: string }) => {
          setSelectedResource(next.value);
          handleInputChange(next.label);
          const nextChange: Partial<ShapeAttribute> = {
            externalId: next.value.externalId,
            subExtractor: undefined,
          };
          if (
            attribute.type === 'ASSET' &&
            Object.keys(next.value?.metadata || {}).length > 0
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
      <Button
        type="primary"
        onClick={() => {
          const error = validateAttribute(attribute);
          if (typeof error === 'string') {
            toast.error(error);
          } else {
            onDone(attribute);
          }
        }}
      >
        Apply
      </Button>
    </AttributeFormWrapper>
  );
};
