import { useState } from 'react';
import Iframe from 'react-iframe';

import styled from 'styled-components';

import { Tooltip } from 'antd';

import { Drawer, Button } from '@cognite/cogs.js';

import { useMetrics } from '../../hooks/useMetrics';
import theme from '../../styles/theme';
import { projectName, getContainer } from '../../utils';
import Breadcrumbs from '../Breadcrumbs';

const BreadcrumbsWrapper = styled.div`
  width: 100%;
  margin-bottom: 5px;
  padding-bottom: 3px;
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid ${theme.breadcrumbsBackground};
`;

export const BreadcrumbsThreeDManagement = ({
  breadcrumbs,
  help,
}: {
  breadcrumbs: { title: string; path?: string }[];
  help: string;
}) => {
  const metrics = useMetrics('Help');
  const [helpVisible, setHelpVisible] = useState(false);
  return (
    <div style={{ marginBottom: '10px', width: '100%' }}>
      {help && (
        <Drawer
          footer={null}
          width="60%"
          title="Cognite Docs"
          visible={helpVisible}
          onCancel={() => setHelpVisible(false)}
          getContainer={getContainer}
        >
          <Iframe
            url={help}
            width="100%"
            height="100%"
            loading="eager"
            className="no-border"
          />
        </Drawer>
      )}
      <div
        style={{
          width: '100%',
          display: 'inline-block',
        }}
      >
        <BreadcrumbsWrapper>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
          {help && (
            <Tooltip
              title="Help"
              placement="left"
              getPopupContainer={getContainer}
            >
              <Button
                type="ghost"
                onClick={() => {
                  metrics.track('Clicked help', {
                    url: help,
                    projectName,
                  });
                  setHelpVisible(true);
                }}
                aria-label="Help"
                size="small"
                icon="Help"
                style={{ color: theme.breadcrumbsText }}
              />
            </Tooltip>
          )}
        </BreadcrumbsWrapper>
      </div>
    </div>
  );
};
