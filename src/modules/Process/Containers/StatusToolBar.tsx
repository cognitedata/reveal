import React from 'react';
import styled from 'styled-components';
import { CDFStatus } from 'src/modules/Common/Components/CDFStatus/CDFStatus';
import { Body } from '@cognite/cogs.js';
import { Breadcrumb } from 'antd';
import { useHistory } from 'react-router-dom';
import { getLink, workflowRoutes } from 'src/modules/Workflow/workflowRoutes';

export const StatusToolBar = (props: any) => {
  const { current, previous } = props;

  return (
    <Container>
      <CustomBreadCrumb current={current} previous={previous} />
      <CDFStatus />
    </Container>
  );
};

const CustomBreadCrumb = (props: any) => {
  const history = useHistory();
  const { current, previous } = props;
  return (
    <Text style={{ fontSize: '14px' }} level={3}>
      <Breadcrumb separator=" ">
        <Breadcrumb.Item
          onClick={() => history.push(getLink(workflowRoutes.home))}
        >
          <span style={{ cursor: 'pointer' }}> CDF /</span>
        </Breadcrumb.Item>

        <Breadcrumb.Item onClick={() => history.goBack()}>
          {previous === 'process' && (
            <span style={{ cursor: 'pointer' }}>
              Contextualize Imagery Data /
            </span>
          )}
          {previous === 'explorer' && current === 'Review' && (
            <span style={{ cursor: 'pointer' }}> Vision Explore /</span>
          )}
        </Breadcrumb.Item>

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
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 0 25px;
`;

const Text = styled(Body)`
  color: #8c8c8c;
`;
