import { Detail, Row, Title } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export type ModelDescriptionProps = {
  name: string;
  description: JSX.Element;
  icon: JSX.Element;
};

export const ModelDescription = (props: ModelDescriptionProps) => {
  return (
    <InfoContainer>
      <StyledRow cols={1}>
        <Title level={6}> Model name </Title>
      </StyledRow>
      <StyledRow cols={1}>
        <Detail style={{ paddingBottom: '17px' }}> {props.name} </Detail>
      </StyledRow>
      <StyledRow cols={1}>
        <Title level={6}>Model description </Title>
      </StyledRow>
      <StyledRow cols={1} style={{ paddingBottom: '17px' }}>
        {props.description}
      </StyledRow>

      <StyledRow cols={1}>
        <Title level={6}>Color and Icon </Title>
        <StyledRow>{props.icon}</StyledRow>
      </StyledRow>
    </InfoContainer>
  );
};

const InfoContainer = styled.div`
  display: grid;
  width: 100%;
  height: 100;
  padding: 17px;
`;

const StyledRow = styled(Row)`
  padding-bottom: 4px;
`;
