import styled from 'styled-components';
import React, { PropsWithChildren } from 'react';
import { AllIconTypes } from '@cognite/cogs.js/dist/Atoms/Icon/Icon';
import { Icon } from '@cognite/cogs.js';

const SectionDiv = styled.div`
  background-color: white;
  margin-bottom: 10px;
  border-radius: 3px;
`;
const SectionHeader = styled.div`
  font-size: 1.1em;
  font-weight: 500;
  padding: 1em;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
`;
const SectionBody = styled.div`
  padding: 0.3em;
`;
export const Section = (
  props: PropsWithChildren<{ title: string; icon: AllIconTypes }>
) => {
  return (
    <SectionDiv className="z-2">
      <SectionHeader>
        <Icon type={props.icon} style={{ marginRight: '0.5rem' }} />{' '}
        {props.title}
      </SectionHeader>
      <SectionBody>{props.children}</SectionBody>
    </SectionDiv>
  );
};
