import React, { useState } from 'react';
import styled from 'styled-components';
import Breadcrumbs from 'components/Breadcrumbs';
import theme from 'styles/theme';
import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import { projectName, getContainer } from 'utils';
import Drawer from 'antd/lib/drawer';
import Iframe from 'react-iframe';
import { useMetrics } from '@cognite/metrics';

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
  padding-bottom: 30px;
  height: 20px;
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
interface NewHeaderProps {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  breadcrumbs?: { title: string; path?: string }[];
  rightItem?: React.ReactElement;
  leftItem?: React.ReactElement;
  ornamentColor?: string;
  help?: string;
}

const NewHeader = ({
  title,
  subtitle,
  breadcrumbs,
  rightItem,
  leftItem,
  ornamentColor,
  help,
}: NewHeaderProps) => {
  const metrics = useMetrics('Help');

  const [helpVisible, setHelpVisible] = useState(false);
  return (
    <div style={{ marginBottom: '22px', width: '100%' }}>
      {help && (
        <Drawer
          title="Cognite Docs"
          visible={helpVisible}
          onClose={() => setHelpVisible(false)}
          width="60%"
          getContainer={getContainer}
        >
          <Iframe
            url={help}
            width="100%"
            height="900px"
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
            {help && (
              <Tooltip
                title="Help"
                placement="left"
                getPopupContainer={getContainer}
              >
                <Icon
                  onClick={() => {
                    metrics.track('Clicked help', {
                      url: help,
                      projectName,
                    });
                    setHelpVisible(true);
                  }}
                  type="question-circle"
                  style={{ fontSize: 22, color: theme.breadcrumbsText }}
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

export default NewHeader;
