import React, { ReactElement } from 'react';
import { getLink, workflowRoutes } from 'src/utils/workflowRoutes';
import styled from 'styled-components';
import { CDFStatus } from 'src/modules/Common/Components/CDFStatus/CDFStatus';
import { Body } from '@cognite/cogs.js';
import { Breadcrumb } from 'antd';
import { useHistory } from 'react-router-dom';

export const StatusToolBar = (props: {
  current: string;
  previous?: string;
  left?: ReactElement;
  right?: ReactElement;
}) => {
  const { current, previous, left, right } = props;

  return (
    <Container>
      <div>{left}</div>
      <BreadCrumbContainer>
        <CustomBreadCrumb current={current} previous={previous} />
        <CDFStatus />
      </BreadCrumbContainer>
      {right}
    </Container>
  );
};

const CustomBreadCrumb = (props: any) => {
  const history = useHistory();
  const { current, previous } = props;
  return (
    <Text style={{ fontSize: '14px' }} level={3}>
      <Breadcrumb separator="/">
        <Breadcrumb.Item
          onClick={() => history.push(getLink(workflowRoutes.home))}
        >
          <span style={{ cursor: 'pointer' }}>CDF</span>
        </Breadcrumb.Item>

        {previous === 'process' && (
          <Breadcrumb.Item onClick={() => history.goBack()}>
            <span style={{ cursor: 'pointer' }}>
              Contextualize Imagery Data
            </span>
          </Breadcrumb.Item>
        )}
        {previous === 'explorer' && current === 'Review' && (
          <Breadcrumb.Item onClick={() => history.goBack()}>
            <span style={{ cursor: 'pointer' }}>
              Image and video management
            </span>
          </Breadcrumb.Item>
        )}

        {current && (
          <Breadcrumb.Item>
            <span style={{ cursor: 'pointer' }}>{current}</span>
          </Breadcrumb.Item>
        )}
      </Breadcrumb>
    </Text>
  );
};

const Container = styled.div`
  border-bottom: 1px solid #d9d9d9;
  display: grid;
  align-items: center;
  grid-template-columns: min-content auto min-content;
  grid-column-gap: 16px;
`;

const BreadCrumbContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  width: 100%;
  padding: 0 25px;
`;

const Text = styled(Body)`
  color: #8c8c8c;
`;
