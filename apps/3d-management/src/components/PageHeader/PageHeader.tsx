import React, { useState } from 'react';
import Iframe from 'react-iframe';

import styled from 'styled-components';

import { Tooltip } from 'antd';

import { Drawer, Button } from '@cognite/cogs.js';

import { useMetrics } from '../../hooks/useMetrics';
import theme from '../../styles/theme';
import { projectName, getContainer } from '../../utils';
import Breadcrumbs from '../Breadcrumbs';

const Title = styled.h5`
  color: black;
  margin-bottom: 0;
  display: inline;
  font-size: 24px;
  padding-right: 30px;
`;

const BreadcrumbsWrapper = styled.div`
  width: 100%;
  margin-bottom: 20px;
  padding-bottom: 6px;
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid ${theme.breadcrumbsBackground};
`;

const Subtitle = styled.div`
  margin-top: 15px;
  margin-bottom: 0;
  font-size: 16px;
  color: ${theme.subtitleColor};
  max-width: 800px;
`;

const TitleOrnament = styled.div`
  width: 80px;
  height: 6px;
  display: flex;
`;

const HeaderWrapper = styled.div`
  display: inline;
`;
const RightPane = styled.div`
  text-align: right;
  float: right;
  display: inline-block;
`;

const LeftPane = styled.div`
  text-align: left;
  float: left;
  display: inline;
`;

interface PageHeaderProps {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  breadcrumbs?: { title: string; path?: string }[];
  rightItem?: React.ReactElement;
  leftItem?: React.ReactElement;
  ornamentColor?: string;
  helpUrl?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  rightItem,
  leftItem,
  ornamentColor,
  helpUrl,
}: PageHeaderProps) => {
  const metrics = useMetrics('3D');
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  return (
    <div style={{ marginBottom: '22px', width: '100%' }}>
      {helpUrl && (
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
      )}

      <div
        style={{
          width: '100%',
          display: 'inline-block',
        }}
      >
        {breadcrumbs && (
          <BreadcrumbsWrapper>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            {helpUrl && (
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
            )}
          </BreadcrumbsWrapper>
        )}
        <HeaderWrapper>
          <LeftPane>
            <Title>{title}</Title>
            {leftItem && <span>{leftItem}</span>}
            <TitleOrnament
              style={{
                backgroundColor: ornamentColor || theme.titleOrnamentColor,
              }}
            />
          </LeftPane>
          <RightPane>{rightItem && <span>{rightItem}</span>}</RightPane>
        </HeaderWrapper>
      </div>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </div>
  );
};
