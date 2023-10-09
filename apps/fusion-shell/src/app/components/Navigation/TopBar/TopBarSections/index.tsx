import { useState } from 'react';

import styled from 'styled-components';

import { Dropdown } from 'antd';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Button, Colors, Flex, Menu } from '@cognite/cogs.js';

import { useTranslation } from '../../../../../i18n';
import { useSections } from '../../../../sections';
import { Section } from '../../../../types';
import { useSubApp } from '../../../../utils/hooks';
import Link from '../../../Link';
import { SectionWrapper } from '../../Menu/Menu';

type TopBarSectionsProps = {
  onClickHome: () => void;
};

const TopBarSections = ({ onClickHome }: TopBarSectionsProps): JSX.Element => {
  const { flow } = getFlow();
  const { t } = useTranslation();

  const subApp = useSubApp();
  const { sections } = useSections();

  const [visibleDropdownKey, setVisibleDropdownKey] = useState<
    Record<string, boolean>
  >({});

  const isSectionActive = (section: Section) =>
    section.items.map((item) => item.linkTo).includes(subApp);

  const isSectionDropdownVisible = (section: Section): boolean =>
    !!visibleDropdownKey[section.internalId];

  const handleVisibleChange = (section: Section, visible: boolean): void => {
    setVisibleDropdownKey((prevState) => ({
      ...prevState,
      [section.internalId]: visible,
    }));
  };

  return (
    <Flex gap={4}>
      <Link onClick={onClickHome} to="/">
        <StyledSectionDropdownButton
          $isActive={subApp === '/' || subApp === '/apps'}
          $isVisible={false}
          type="ghost"
          inverted
        >
          {t('section-navtitle-home')}
        </StyledSectionDropdownButton>
      </Link>
      {sections.map((section) => (
        <Dropdown
          key={section.internalId}
          visible={isSectionDropdownVisible(section)}
          onVisibleChange={(visible) => handleVisibleChange(section, visible)}
          overlay={
            <StyledSectionDropdownMenu>
              <SectionWrapper
                flow={flow}
                onClose={() => handleVisibleChange(section, false)}
                section={section}
                showSectionName={false}
              />
            </StyledSectionDropdownMenu>
          }
          placement="bottomLeft"
          trigger={['click']}
        >
          <StyledSectionDropdownButton
            $isActive={isSectionActive(section)}
            $isVisible={isSectionDropdownVisible(section)}
            type="ghost"
            inverted
            data-testid={`topbar-${section.internalId}`}
          >
            {t(`section-navtitle-${section.internalId}`)}
          </StyledSectionDropdownButton>
        </Dropdown>
      ))}
    </Flex>
  );
};

const StyledSectionDropdownMenu = styled(Menu)`
  max-width: 400px;
  min-width: 300px;
  max-height: 85vh;
  overflow-y: auto;
`;

export const StyledSectionDropdownButton = styled(Button)<{
  $isActive?: boolean;
  $isVisible?: boolean;
}>`
  line-height: unset;

  && {
    ${({ $isVisible }) =>
      $isVisible &&
      `
      background-color: ${Colors['surface--interactive--pressed--inverted']};
      :hover {
        background-color: ${Colors['surface--interactive--pressed--inverted']};
      }
    `};

    ${({ $isActive, $isVisible }) =>
      $isActive &&
      `
      color: ${Colors['text-icon--interactive--default--inverted']};
      background-color: ${
        $isVisible
          ? Colors['surface--interactive--toggled-pressed--inverted']
          : Colors['surface--interactive--toggled-default--inverted']
      };
      :hover {
        background-color: ${
          $isVisible
            ? Colors['surface--interactive--toggled-pressed--inverted']
            : Colors['surface--interactive--toggled-hover--inverted']
        };
      }
      :active {
        background-color: ${
          Colors['surface--interactive--toggled-pressed--inverted']
        };
      }
    `};
  }
`;

export default TopBarSections;
