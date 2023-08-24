import styled from 'styled-components';

import { ProductLogo } from '@cognite/cogs.js';

import { useTranslation } from '../../common';

import { getAppsInfo } from './TopBar';

const AppSelectorWrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: var(--cogs-elevation--overlay);
  gap: 8px;

  margin-right: 16px;
  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr 1fr;
    width: 100vw;
  }
  @media screen and (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;
const AppSelectorItem = styled.div`
  display: flex;
  cursor: pointer;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  &:hover {
    background: var(--cogs-bg-hover);
  }
`;
const LogoWrapper = styled.div``;

export const AppSelector = () => {
  const { t } = useTranslation();
  const navigate = (url: string) => () => {
    window.open(url, '_blank');
  };
  const apps = getAppsInfo(t);

  return (
    <AppSelectorWrapper>
      {apps.map((app) => {
        return (
          <AppSelectorItem onClick={navigate(app?.link)}>
            <LogoWrapper>
              <ProductLogo type={app?.icon} />
            </LogoWrapper>
            <div>
              <h3>{app?.name}</h3>
              <p>{app?.description}</p>
            </div>
          </AppSelectorItem>
        );
      })}
    </AppSelectorWrapper>
  );
};
