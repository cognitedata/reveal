import { Body, Title } from '@cognite/cogs.js';
import React from 'react';
import { AccessPermission } from 'src/utils/types';
import styled from 'styled-components';

type Props = {
  capabilities: Array<AccessPermission>;
};

export default function NoAccessPage({ capabilities }: Props) {
  return (
    <Container>
      <div>
        <TitleContainer>
          <Title level={2}>Request access to Contextualize Imagery Data</Title>
        </TitleContainer>
        <BodyContainer>
          <Body level={1}>
            You don’t have an access to view this page yet. Check the access
            rights needed below:
          </Body>
        </BodyContainer>
        <BodyContainer>
          <ListContainer>
            <Body level={2}>
              It is prerequisite to have:
              <ul>
                <li>Files</li>
                <li>Files</li>
              </ul>
            </Body>
          </ListContainer>
        </BodyContainer>
        <BodyContainer>
          <Body level={1}>
            Ask those responsible within your organisation for access management
            to grant them to you.
            <br />
            Learn more about access management in documentation.
          </Body>
        </BodyContainer>
        <div>
          <pre>capabilities</pre>
        </div>
      </div>
      <div />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;

  position: absolute;
  width: 899px;
  height: 300px;
  left: 208px;
  top: 144px;
  border: solid 1px;
`;

const TitleContainer = styled.div`
  flex: none;
  order: 0;
  flex-grow: 0;
  margin: 24px 0px;
  width: 665px;
  border: solid 1px;
`;

const BodyContainer = styled.div`
  flex: none;
  order: 1;
  flex-grow: 0;
  margin: 16px 0px;
  width: 665px;
  border: solid 1px;
`;

const ListContainer = styled.div`
  flex: none;
  order: 1;
  flex-grow: 0;
  margin: 16px;
  border: dotted 1px;
`;
