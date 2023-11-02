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
  helpUrl,
}: {
  breadcrumbs: { title: string; path?: string }[];
  helpUrl: string;
}) => {
  const metrics = useMetrics('3D');
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  return (
    <div style={{ marginBottom: '10px', width: '100%' }}>
      <Drawer
        footer={null}
        width="60%"
        title="Cognite Docs"
        visible={isHelpVisible}
        onCancel={() => setIsHelpVisible(false)}
        getContainer={getContainer}
      >
        <Iframe
          url={helpUrl}
          width="100%"
          height="100%"
          loading="eager"
          className="no-border"
        />
      </Drawer>

      <div
        style={{
          width: '100%',
          display: 'inline-block',
        }}
      >
        <BreadcrumbsWrapper>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
          <Tooltip
            title="Help"
            placement="left"
            getPopupContainer={getContainer}
          >
            <Button
              type="ghost"
              onClick={() => {
                metrics.track('Help.Clicked', {
                  url: helpUrl,
                  projectName,
                });
                setIsHelpVisible(true);
              }}
              aria-label="Help"
              size="small"
              icon="Help"
              style={{ color: theme.breadcrumbsText }}
            />
          </Tooltip>
        </BreadcrumbsWrapper>
      </div>
    </div>
  );
};
