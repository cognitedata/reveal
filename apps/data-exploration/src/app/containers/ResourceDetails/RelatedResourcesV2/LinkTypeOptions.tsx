import React, { useState, useEffect } from 'react';

import styled from 'styled-components/macro';

import { SegmentedControl } from '@cognite/cogs.js';

import { ResourceType, ResourceItem } from '@data-exploration-lib/core';

import { LinkType } from './types';
import { useLinkTypeOptions } from './useLinkTypeOptions';

export interface LinkTypeOptionsProps {
  resource: ResourceItem;
  relatedResourcesType: ResourceType;
  onChange: (linkType: LinkType) => void;
}

export const LinkTypeOptions: React.FC<LinkTypeOptionsProps> = ({
  resource,
  relatedResourcesType,
  onChange,
}) => {
  const [selectedLinkType, setSelectedLinkType] = useState<LinkType>();

  const options = useLinkTypeOptions({ resource, relatedResourcesType });

  const handleChangeLinkType = (linkType: LinkType) => {
    setSelectedLinkType(linkType);
    onChange(linkType);
  };

  useEffect(() => {
    if (selectedLinkType) {
      return;
    }

    const initialOption =
      options.find((option) => option.count > 0) ||
      options.find((option) => option.enabled !== false);

    if (initialOption) {
      handleChangeLinkType(initialOption.key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return (
    <LinkTypeOptionsWrapper data-testid="linked-type-options">
      <SegmentedControl
        currentKey={selectedLinkType}
        onButtonClicked={handleChangeLinkType}
      >
        {options.map(({ key, label, enabled = true }) => {
          if (!enabled) {
            return <></>;
          }
          return (
            <SegmentedControl.Button key={key}>{label}</SegmentedControl.Button>
          );
        })}
      </SegmentedControl>
    </LinkTypeOptionsWrapper>
  );
};

const LinkTypeOptionsWrapper = styled.div`
  .cogs-segmented-control__list__button__text {
    font-weight: 500;
  }
  margin: 16px;
  margin-bottom: 0;
`;
