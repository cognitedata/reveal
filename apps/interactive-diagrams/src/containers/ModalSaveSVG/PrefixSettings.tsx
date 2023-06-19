import React, { useContext } from 'react';

import { Input, Chip } from '@cognite/cogs.js';

import { Flex } from '../../components/Common';
import { AppStateContext } from '../../context';

export const PrefixSettings = () => {
  const { svgPrefix, setSvgPrefix } = useContext(AppStateContext);
  const prefixPreview = `${svgPrefix}_filename.svg`;

  const onSvgPrefixChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSvgPrefix(event.target.value ?? '');

  return (
    <Flex column style={{ margin: '12px 16px' }}>
      <Flex row align>
        <Input
          value={svgPrefix}
          onChange={onSvgPrefixChange}
          style={{ minWidth: '200px' }}
        />
        <Chip
          label="_filename.svg"
          type="default"
          css={{ marginLeft: '12px' }}
        />
      </Flex>
      <Chip
        label={`Preview: "${prefixPreview}"`}
        css={{ whiteSpace: 'nowrap', marginTop: '28px' }}
      />
    </Flex>
  );
};
