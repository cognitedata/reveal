import React from 'react';
import { InternalId } from '@cognite/sdk';
import { ResourceType } from 'lib';

import SelectedResourcesTitleRow from './SelectedResourcesTitleRow';
import Summary from './Summary';

type Props = {
  ids: InternalId[];
  resourceType: ResourceType;
};

export default function SelectionResults({ ids, resourceType }: Props) {
  return (
    <>
      <SelectedResourcesTitleRow ids={ids} resourceType={resourceType} />
      <Summary ids={ids} resourceType={resourceType} />
    </>
  );
}
