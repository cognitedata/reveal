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
  font-size: 1.1rem;
  font-weight: 500;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
`;
const SectionBody = styled.div`
  padding: 1em 0;
`;
export const SectionWithoutHeader = (props: PropsWithChildren<{}>) => (
  <SectionDiv className="z-2">{props.children}</SectionDiv>
);
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
