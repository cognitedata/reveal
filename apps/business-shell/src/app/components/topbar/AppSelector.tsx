import styled from 'styled-components';

import { ProductLogo } from '@cognite/cogs.js';

import { useTranslation } from '../../common';

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

  return (
    <AppSelectorWrapper>
      <AppSelectorItem onClick={navigate('/infield')}>
        <LogoWrapper>
          <ProductLogo type="InField" />
        </LogoWrapper>
        <div>
          <h3>{t('INFIELD_APP_TITLE')}</h3>
          <p>{t('INFIELD_APP_SUBTITLE')}</p>
        </div>
      </AppSelectorItem>
      <AppSelectorItem onClick={navigate('/maintain')}>
        <LogoWrapper>
          <ProductLogo type="Maintain" />
        </LogoWrapper>
        <div>
          <h3>{t('MAINTAIN_APP_TITLE')}</h3>
          <p>{t('MAINTAIN_APP_SUBTITLE')}</p>
        </div>
      </AppSelectorItem>
      <AppSelectorItem onClick={navigate('/inrobot')}>
        <LogoWrapper>
          <ProductLogo type="BestDay" />
        </LogoWrapper>
        <div>
          <h3>{t('INROBOT_APP_TITLE')}</h3>
          <p>{t('INROBOT_APP_SUBTITLE')}</p>
        </div>
      </AppSelectorItem>
      <AppSelectorItem onClick={navigate('https://fusion.cognite.com')}>
        <LogoWrapper>
          <ProductLogo type="CDF" />
        </LogoWrapper>
        <div>
          <h3>{t('DATA_OPS_APP_TITLE')}</h3>
          <p>{t('DATA_OPS_APP_SUBTITLE')}</p>
        </div>
      </AppSelectorItem>
    </AppSelectorWrapper>
  );
};
