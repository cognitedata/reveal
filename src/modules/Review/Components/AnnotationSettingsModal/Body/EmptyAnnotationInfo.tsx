import React from 'react';
import { Body, Col, Icon, Row, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

export const renderEmptyAnnotationMessage = (shape: string) => {
  return (
    <Row
      cols={10}
      style={{
        background: '#6E85FC0F',
        borderRadius: '8px',
        alignItems: 'flex-start',
        padding: '5px',
      }}
    >
      <StyledCol span={1}>
        <Icon type="InfoFilled" style={{ color: '#4A67FB' }} />
      </StyledCol>

      <StyledCol span={9}>
        <Title level={5}>No existing annotations</Title>
        <Body level={2} style={{ paddingBottom: '15px', paddingTop: '8px' }}>
          Create a new {shape} annotation to have a pre-defined list of
          annotations that will be saved in your settings.
        </Body>
      </StyledCol>
    </Row>
  );
};

const StyledCol = styled(Col)`
  padding: 5px 5px 5px 14px;
`;
