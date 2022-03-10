import {
  Button,
  Dropdown,
  Flex,
  Icon,
  IconType,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';
import { useResourceQuery } from 'hooks/useQuery/useResourceQuery';
import startCase from 'lodash/startCase';
import { useState } from 'react';
import { ShapeAttribute } from 'typings/rules';
import { Timeseries } from '@cognite/sdk';
import { useAttributeValueQuery } from 'models/rulesEngine/useAttributeValueQuery';

import { AttributeWrapper } from './elements';
import { AttributeForm } from './AttributesForm';

type AttributeDisplayProps = {
  attribute: ShapeAttribute;
  onChange: (nextAttr: ShapeAttribute) => void;
  onDelete: () => void;
};

export const AttributeDisplay = ({
  attribute,
  onChange,
  onDelete,
}: AttributeDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const { data: selectedResource } = useResourceQuery(
    attribute.type,
    attribute.externalId
      ? {
          externalId: attribute.externalId,
        }
      : undefined
  );

  const {
    data: attributeValue,
    isLoading: isLoadingAttributeValue,
    error: errorLoadingAttributeValue,
  } = useAttributeValueQuery(attribute, selectedResource);

  const getIcon = (): IconType => {
    switch (attribute.type) {
      case 'ASSET':
        return 'Assets';
      case 'TIMESERIES':
      default:
        return 'Timeseries';
    }
  };

  if (isEditing) {
    return (
      <AttributeForm
        existingAttribute={attribute}
        onDone={(next) => {
          onChange(next);
          setIsEditing(false);
        }}
      />
    );
  }

  const renderAttributeValue = () => {
    if (isLoadingAttributeValue) {
      return <Icon type="Loader" />;
    }
    if (errorLoadingAttributeValue) {
      return (
        <Tooltip content={<>{errorLoadingAttributeValue.message}</>}>
          <Icon type="Warning" />
        </Tooltip>
      );
    }
    if (
      attribute.type === 'TIMESERIES' &&
      attribute.extractor === 'CURRENT_VALUE' &&
      (selectedResource as Timeseries)?.unit
    ) {
      return (
        <>
          {attributeValue} {(selectedResource as Timeseries).unit}
        </>
      );
    }
    return attributeValue;
  };

  return (
    <AttributeWrapper>
      <Icon type={getIcon()} style={{ width: 16, flexShrink: 0 }} />
      <Flex direction="column" className="details">
        <Flex justifyContent="space-between">
          <strong>{attribute?.name}</strong>
          <strong>{renderAttributeValue()}</strong>
        </Flex>
        <div style={{ overflowWrap: 'anywhere' }}>
          {selectedResource?.name} <Icon type="ArrowRight" />{' '}
          {startCase(attribute.extractor)}
          {startCase(attribute.subExtractor)
            ? `.${startCase(attribute.subExtractor)}`
            : ''}
        </div>
      </Flex>
      <Dropdown
        content={
          <Menu>
            <Menu.Item
              onClick={() => {
                setIsEditing(!isEditing);
              }}
            >
              Edit
            </Menu.Item>
            <Menu.Item onClick={onDelete}>Delete</Menu.Item>
          </Menu>
        }
      >
        <Button type="ghost" icon="EllipsisVertical" />
      </Dropdown>
    </AttributeWrapper>
  );
};
