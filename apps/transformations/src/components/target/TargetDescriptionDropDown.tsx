import { useState } from 'react';

import { TransformationRead } from '@transformations/types';
import { shouldDisableUpdatesOnTransformation } from '@transformations/utils';

import { Body, Button, Flex } from '@cognite/cogs.js';

import TargetDescription from './TargetDescription';
import TargetModal from './TargetModal';

type Props = {
  transformation: TransformationRead;
};
export default function TargetDescriptionDropDown({ transformation }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const shouldDisableUpdates =
    shouldDisableUpdatesOnTransformation(transformation);

  return (
    <Flex alignItems="center" gap={4}>
      <Body
        strong
        level={2}
        style={{
          maxWidth: '90%',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <TargetDescription
          destination={transformation.destination}
          conflictMode={transformation.conflictMode}
        />
      </Body>
      <Button
        type="ghost"
        size="small"
        icon={dropdownOpen ? 'Close' : 'ChevronDown'}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={shouldDisableUpdates}
      />
      <TargetModal
        onCancel={() => setDropdownOpen(false)}
        transformation={transformation}
        visible={dropdownOpen}
      />
    </Flex>
  );
}
