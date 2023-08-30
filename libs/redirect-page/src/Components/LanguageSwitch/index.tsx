import React, { useState } from 'react';

import styled from 'styled-components';

import { noop } from 'lodash-es';

import { Button } from '../../Components/Button';
import { Colors } from '../../Components/Colors';

import GlobeIcon from './GlobeIcon';
import { getLanguageLabel } from './util';

type HtmlElementProps = React.HTMLAttributes<HTMLButtonElement>;

interface LanguageSwitchProps extends HtmlElementProps {
  id?: string;
  language?: string;
  icon?: any;
  label?: string;
  title?: string;
  languages?: string[];
  toggleLanguage?: (lang: string) => void;
}

interface LanguageMenuProps extends LanguageSwitchProps {
  position?: Record<string, number>;
  onMouseLeave?: () => void;
}

export const LanguageMenu = ({
  title,
  language: curLanguage,
  languages,
  toggleLanguage = noop,
  onMouseLeave = noop,
}: // position // TODO: set LanguageMenu position relative to SwitchContainer
LanguageMenuProps) => {
  return languages?.length ? (
    <MenuWrapper onMouseLeave={onMouseLeave}>
      <Menu>
        {title && <MenuHeader>{title}</MenuHeader>}
        {languages.map((langCode) => {
          const languageLabel = getLanguageLabel(langCode);
          return languageLabel ? (
            <MenuItem key={languageLabel.toLocaleLowerCase()}>
              <MenuItemButton
                style={curLanguage === langCode ? { fontWeight: 600 } : {}}
                type="link"
                onClick={() => {
                  toggleLanguage(langCode);
                  onMouseLeave();
                }}
              >
                {languageLabel}
              </MenuItemButton>
            </MenuItem>
          ) : null;
        })}
      </Menu>
    </MenuWrapper>
  ) : null;
};

export const Switch = (props: LanguageSwitchProps) => {
  const { id = 'languageSwitchId', icon, label, languages = ['en'] } = props;
  const [isVisible, setVisibleStatus] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState<
    Record<string, number>
  >({ top: 0, left: 0 });

  const showLanguageMenu = () => {
    const parent = document.getElementById(id)?.getBoundingClientRect() || {
      top: 0,
      left: 0,
    };
    setDropdownPosition({
      ...dropdownPosition,
      top: Math.floor(parent.top + 10),
      left: Math.floor(parent.left),
    });
    setVisibleStatus(true);
  };

  const hideLanguageMenu = () => {
    setVisibleStatus(false);
  };

  const switchIcon = icon || <GlobeIcon />;

  return (
    <>
      <SwitchContainer
        id={id}
        $isLabel={Boolean(label)}
        onMouseEnter={showLanguageMenu}
      >
        <Icon>{switchIcon}</Icon>
        {label && <Label>{label}</Label>}
      </SwitchContainer>
      {isVisible && languages?.length && (
        <LanguageMenu
          {...props}
          position={dropdownPosition}
          onMouseLeave={hideLanguageMenu}
        />
      )}
    </>
  );
};

export const LanguageSwitch = (props: LanguageSwitchProps) => {
  return (
    <Wrapper>
      <Switch {...props} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: absolute;
  top: 3%;
  right: 3%;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
`;

const SwitchContainer = styled.div<{ $isLabel: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: ${({ $isLabel }) => `${$isLabel ? 'flex-start' : 'center'}`};
  align-items: center;
  padding: 8px 12px;
  background: inherit;
  border-radius: inherit;
  height: 36px;
  min-width: 36px;
  cursor: pointer;
`;

const Icon = styled.div`
  margin: 0 4px;
`;

const Label = styled.span`
  color: rgba(0, 0, 0, 0.9);
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
`;

const MenuWrapper = styled.div`
  position: absolute;
  display: flex;
  min-width: 150px;
  width: max-content;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: ${Colors['box-shadow']};
  right: 0;
  margin-top: 6px;
`;

const Menu = styled('ul')`
  padding: 16px 4px;
  margin: 0;
  list-style-type: none;
  background: inherit;
  border-radius: inherit;
`;

const MenuHeader = styled.div`
  color: rgba(0, 0, 0, 0.55);
  font-size: 12px;
  font-weight: 400;
  text-align: left;
  line-height: 16px;
  padding: 0 12px 6px 12px;
`;

const MenuItem = styled('li')`
  width: 100%;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
`;

const MenuItemButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;
  color: rgba(0, 0, 0, 0.7) !important;
`;
