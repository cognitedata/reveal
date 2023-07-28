import { MouseEvent } from 'react';

import styled from 'styled-components';

import { Row, Col } from 'antd';

import { Icon, Tooltip } from '@cognite/cogs.js';
import { IDPType } from '@cognite/login-utils';
import { useFlag } from '@cognite/react-feature-flags';

import { useTranslation } from '../../../../i18n';
import theme from '../../../styles/theme';
import { Section, AppItem, Tag } from '../../../types';
import {
  useExperimentalFeatures,
  useFeatureToggledItems,
} from '../../../utils/hooks';
import { ZIndexLayer } from '../../../utils/zIndex';

import MenuItem from './Item';
import MenuSection from './Section';

interface MenuProps {
  visible: boolean;
  onClose(destination: string): void;
  sections: Section[];
  flow: IDPType;
}

interface MenuMaskProps {
  visible: boolean;
}

const MenuMask = styled.div<MenuMaskProps>`
  position: fixed;
  top: var(--cdf-ui-navigation-height);
  z-index: ${ZIndexLayer.Menu};
  width: 100%;
  height: calc(100vh - var(--cdf-ui-navigation-height));
  background-color: rgba(0, 0, 0, 0.2);
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: visibility 0s linear ${(props) => (props.visible ? '0s' : '0.3s')},
    opacity 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
`;

interface StyledMenuProps {
  visible: boolean;
}

const StyledMenu = styled.div<StyledMenuProps>`
  position: fixed;
  top: var(--cdf-ui-navigation-height);
  width: 100%;
  max-height: calc(100vh - var(--cdf-ui-navigation-height));
  opacity: ${(props) => (props.visible ? 1 : 0)};
  background-color: #ffffff;
  box-shadow: 0px 8px 48px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transform: ${(props) => (props.visible ? 'scaleY(1)' : 'scaleY(0.8)')};
  transform-origin: 0% 0%;
  transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),
    opacity 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),
    visibility 0s linear ${(props) => (props.visible ? '0s' : '0.3s')};
`;

const Content = styled.div`
  padding: 12px 48px 56px 48px;
  max-height: calc(100vh - var(--cdf-ui-navigation-height));
  overflow-y: auto;
`;

const CloseButtonWrapper = styled.div`
  position: absolute;
  top: 12px;
  right: 48px;
`;

const CloseButton = styled.div`
  width: 48px;
  height: 48px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  background-color: ${theme.navigationButton};
  &:hover {
    background-color: ${theme.navigationButtonHover};
  }
`;

const getExperimentalTag = (title: string, description: string): Tag => ({
  title,
  description,
  color: 'var(--cogs-yellow-5)',
});

interface SectionWrapperProps {
  flow?: IDPType;
  section: Section;
  showSectionName?: boolean;
  onClose?(dest: string): void | undefined;
  isCompact?: boolean;
}

export function SectionWrapper(props: SectionWrapperProps) {
  const { t } = useTranslation();
  const { section, showSectionName, onClose, isCompact = false } = props;

  // Feature toggle used for CDF development purposes
  // that enables all sub-apps in CDF UI
  const { isEnabled: shouldEnableAllApps } = useFlag('CDF_ALL_FEATURES');

  const { isEnabled: shouldHideTags } = useFlag('HIDE_EXPERIMENTAL_TAGS', {
    fallback: false,
    forceRerender: true,
  });

  const experimentalFeatures = useExperimentalFeatures();

  const renderItem = (item: AppItem) => {
    let tag;
    if (
      window.location.hostname !== 'localhost:8080' &&
      experimentalFeatures[item.internalId] &&
      !shouldHideTags
    ) {
      const experimentalTag = getExperimentalTag(
        t('label-experimental-title'),
        t('label-experimental-desc')
      );
      tag = experimentalTag;
    }
    return (
      <MenuItem
        item={item}
        key={item.title}
        onClose={onClose}
        tag={tag}
        isCompact={isCompact}
      />
    );
  };

  const itemsEnabled = useFeatureToggledItems(section.items);
  const items = shouldEnableAllApps ? [...section.items] : [...itemsEnabled];

  if (items.length === 0) return null;

  return (
    <MenuSection
      section={section}
      showSectionName={showSectionName}
      key={section.internalId}
      isCompact={isCompact}
    >
      {items.map((item: AppItem) => renderItem(item))}
    </MenuSection>
  );
}

export default function Menu(props: MenuProps) {
  const { visible, onClose, sections, flow } = props;
  const { t } = useTranslation();

  const onCloseButtonClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    onClose('close-button');
  };

  return (
    <MenuMask onClick={() => onClose('mask')} visible={visible}>
      <StyledMenu visible={visible} onClick={(e) => e.stopPropagation()}>
        <Content>
          <Row gutter={[20, 20]}>
            {sections.filter(Boolean).map((s) => (
              <Col xxl={6} xl={6} lg={12} md={12} xs={24} key={s.internalId}>
                <SectionWrapper
                  flow={flow}
                  key={s.internalId}
                  section={s}
                  onClose={onClose}
                />
              </Col>
            ))}
          </Row>
          <CloseButtonWrapper>
            <Tooltip
              interactive
              content={t('tooltip-close')}
              placement="bottom"
            >
              <CloseButton onClick={onCloseButtonClick}>
                <Icon type="Close" />
              </CloseButton>
            </Tooltip>
          </CloseButtonWrapper>
        </Content>
      </StyledMenu>
    </MenuMask>
  );
}
