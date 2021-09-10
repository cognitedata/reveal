import React, { useContext } from 'react';
import { Input, Label } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Flex } from 'components/Common';
import { AppStateContext } from 'context';

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
        <Label variant="unknown" style={{ marginLeft: '12px' }}>
          _filename.svg
        </Label>
      </Flex>
      <Label style={{ whiteSpace: 'nowrap', marginTop: '28px' }}>
        <LabelStatic>Preview:</LabelStatic>
        <LabelDynamic>&quot;{prefixPreview}&quot;</LabelDynamic>
      </Label>
    </Flex>
  );
};

const LabelStatic = styled.span`
  font-weight: 500;
  font-size: 13px;
  margin-right: 3px;
`;
const LabelDynamic = styled.span`
  font-weight: 600;
  font-size: 15px;
`;
