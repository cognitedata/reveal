import styled from 'styled-components';
import React, { PropsWithChildren } from 'react';
import { IconType, Icon, Button, Flex, Body } from '@cognite/cogs.js';
import { useTranslation } from 'common';

const SectionDiv = styled.div`
  background-color: white;
  margin-bottom: 1rem;
  border-radius: 3px;
`;
const SectionHeaderRow = styled(Flex)`
  padding: 0 1rem;
  border-bottom: 1px solid #eee;
  min-height: 3.5rem;
`;
const SectionHeader = styled(Flex)`
  font-weight: 500;
  font-size: 1.1rem;
`;
const SectionBody = styled.div`
  padding: 1rem 0;
  overflow-x: scroll;
`;
export const SectionWithoutHeader = (props: PropsWithChildren<{}>) => (
  <SectionDiv className="z-2">{props.children}</SectionDiv>
);
type Props = {
  title: string;
  rightTitle?: string | JSX.Element;
  icon: IconType;
  titleButton?: { onClick: () => void; enabled: boolean };
  dataTestId?: string;
};
export const Section = ({
  icon,
  title,
  titleButton,
  rightTitle,
  children,
  dataTestId,
}: PropsWithChildren<Props>) => {
  const { t } = useTranslation();

  return (
    <SectionDiv className="z-2" data-testid={dataTestId}>
      <SectionHeaderRow alignItems="center" justifyContent="space-between">
        <SectionHeader alignItems="center">
          <Icon type={icon} style={{ marginRight: '0.5rem' }} /> {title}
        </SectionHeader>
        <div>
          {titleButton && (
            <Button
              type="ghost"
              disabled={!titleButton.enabled}
              onClick={titleButton.onClick}
            >
              {t('edit')}
            </Button>
          )}
          {rightTitle && <Body level={2}>{rightTitle}</Body>}
        </div>
      </SectionHeaderRow>
      <SectionBody>{children}</SectionBody>
    </SectionDiv>
  );
};
