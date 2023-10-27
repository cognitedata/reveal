import React, { PropsWithChildren } from 'react';

import styled from 'styled-components';

import { Typography } from '@fdx/components';
import zIndex from '@fdx/shared/utils/zIndex';

import { Button, Skeleton, Title } from '@cognite/cogs.js';

interface Props {
  header?: string;
  title?: string;
  subtitle?: string;
  onBackClick?: () => void;
  loading?: boolean;
  alignActions?: 'right' | 'left';
}

export const PageHeader: React.FC<PropsWithChildren<Props>> = ({
  children,
  header,
  title,
  subtitle,
  onBackClick,
  loading,
  alignActions = 'right',
}) => {
  const hasContent = title || subtitle || header || loading;

  return (
    <Header>
      <Content>
        {onBackClick && (
          <Button
            icon="ArrowLeft"
            size="small"
            aria-label="Back button"
            onClick={onBackClick}
          />
        )}

        {hasContent && (
          <Wrapper>
            {loading ? (
              <Skeleton.Paragraph lines={2} />
            ) : (
              <>
                {header && <HeaderText>{header}</HeaderText>}
                <Title level={4}>{title}</Title>
                <DescriptionText>{subtitle}</DescriptionText>
              </>
            )}
          </Wrapper>
        )}

        <Actions align={alignActions}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { loading } as any);
            }
            return null;
          })}
        </Actions>
      </Content>
    </Header>
  );
};

const Header = styled.div`
  min-height: 90px;
  display: flex;
  justify-content: center;
  position: sticky;
  top: 0;
  left: 0;
  overflow: auto;
  background: linear-gradient(180deg, #fafafa 0%, rgba(243, 244, 248, 0) 100%);
  backdrop-filter: blur(8px);
  z-index: ${zIndex.PAGE_HEADER};
  padding: 0 16px;
`;

const Actions = styled.div<{ align?: 'left' | 'right' }>`
  ${({ align }) =>
    align === 'left' ? 'margin-right: auto;' : 'margin-left: auto;'};
  gap: 8px;
  display: flex;
`;

const Content = styled.div`
  width: 100%;
  max-width: 1024px;
  flex-direction: row;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 8px;
`;

const Wrapper = styled.span`
  min-width: 100px;
  width: 100%;
  max-width: 80%;
`;

const HeaderText = styled(Typography.Body).attrs({
  size: 'xsmall',
  strong: true,
})`
  color: var(--border-status-neutral-strong, #4078f0);
`;

const DescriptionText = styled(Typography.Body).attrs({
  size: 'xsmall',
})`
  width: 50%;
`;
