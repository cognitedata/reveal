import React, { useState } from 'react';

import styled from 'styled-components';

import { Dropdown } from 'antd';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Colors, Detail } from '@cognite/cogs.js';

import { useTranslation } from '../../../../i18n';
import { useSections } from '../../../sections';
import { useSubApp } from '../../../utils/hooks';
import { SectionWrapper } from '../Menu/Menu';
import { StyledSectionDropdownButton } from '../TopBar/TopBarSections';

export const OverflowMenu = () => {
  const { t } = useTranslation();
  const { flow } = getFlow();
  const { sections } = useSections();

  const subApp = useSubApp();

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const isActive =
    subApp.length > 1 &&
    sections.some(({ items }) =>
      items.some(({ linkTo }) => linkTo?.includes(subApp))
    );

  return (
    <Dropdown
      placement="bottom"
      onVisibleChange={setIsDropdownVisible}
      overlay={
        <MenuWrapper>
          {sections.map((section) => {
            const title = t(`section-navtitle-${section.internalId}`);
            return (
              <Section key={`${title}_nav_section`}>
                <StyledSectionTitle>{title}</StyledSectionTitle>
                <SectionWrapper
                  flow={flow}
                  section={section}
                  showSectionName={false}
                  isCompact
                />
              </Section>
            );
          })}
        </MenuWrapper>
      }
      trigger={['click']}
    >
      <StyledSectionDropdownButton
        $isActive={isActive}
        $isVisible={isDropdownVisible}
        icon="ChevronDownSmall"
        iconPlacement="right"
        type="ghost"
        inverted
      >
        {t('text-menu')}
      </StyledSectionDropdownButton>
    </Dropdown>
  );
};

const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%),
    0 9px 28px 8px rgb(0 0 0 / 5%);
  border-radius: 6px;
  background-color: white;
  max-width: 90vw;
  width: 480px;
  max-height: 85vh;
  overflow-y: auto;
`;

const StyledSectionTitle = styled(Detail)`
  color: ${Colors['text-icon--muted']};
  margin-bottom: 8px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;

  :not(:last-child) {
    border-bottom: 1px solid ${Colors['border--interactive--default']};
  }
`;
