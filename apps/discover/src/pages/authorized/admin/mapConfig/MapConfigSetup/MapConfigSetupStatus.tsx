import * as React from 'react';

import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

const IconParagraph = styled.div`
  display: flex;
  align-items: center;
  div {
    padding-left: 5px;
  }
`;
const Wrapper = styled.div`
  background: #f3f3f3;
  color: #111;
  padding: 20px 20px 5px 20px;
`;
const StatusWrapper = styled.div`
  margin-top: 15px;
`;
const Footer = styled.div`
  margin: 20px;
`;

const ErrorParagraph = styled(IconParagraph)``;
const GoodParagraph = styled(IconParagraph)``;

interface Props {
  missing: string[];
  found: string[];
}
export const MapConfigSetupStatus: React.FC<React.PropsWithChildren<Props>> = ({
  missing,
  found,
  children,
}) => {
  return (
    <Wrapper>
      <div>
        <strong>Status:</strong>
        <StatusWrapper>
          {missing.map((name) => {
            return (
              <ErrorParagraph key={name}>
                <Icon type="ErrorFilled" style={{ color: '#D51A46' }} />
                <div>{name}</div>
              </ErrorParagraph>
            );
          })}
          {found.map((name) => {
            return (
              <GoodParagraph key={name}>
                <Icon type="CheckmarkFilled" style={{ color: '#18AF8E' }} />
                <div>{name}</div>
              </GoodParagraph>
            );
          })}
        </StatusWrapper>
      </div>
      <Footer>{children}</Footer>
    </Wrapper>
  );
};
