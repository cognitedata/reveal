import styled from 'styled-components';

import { ProductLogo } from '@cognite/cogs.js';

import { translationKeys } from '../../common';
import { useTranslation } from '../../hooks';

const AppSelectorWrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: var(--cogs-elevation--overlay);
  gap: 8px;
  width: 800px;
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
          <h3>{t(translationKeys.APP_INFIELD_TITLE, 'Infield')}</h3>
          <p>
            {t(
              translationKeys.APP_INFIELD_SUBTITLE,
              'Create and execute field operations'
            )}
          </p>
        </div>
      </AppSelectorItem>
      <AppSelectorItem onClick={navigate('/maintain')}>
        <LogoWrapper>
          <ProductLogo type="Maintain" />
        </LogoWrapper>
        <div>
          <h3>{t(translationKeys.APP_MAINTAIN_TITLE, 'Maintain')}</h3>
          <p>
            {t(
              translationKeys.APP_MAINTAIN_SUBTITLE,
              'Plan and optimise asset maintenance'
            )}
          </p>
        </div>
      </AppSelectorItem>
      <AppSelectorItem onClick={navigate('/inrobot')}>
        <LogoWrapper>
          <ProductLogo type="Remote" />
        </LogoWrapper>
        <div>
          <h3>{t(translationKeys.APP_INROBOT_TITLE, 'InRobot')}</h3>
          <p>
            {t(
              translationKeys.APP_INROBOT_SUBTITLE,
              'Configure and operate robots at your asset'
            )}
          </p>
        </div>
      </AppSelectorItem>
      <AppSelectorItem onClick={navigate('https://fusion.cognite.com')}>
        <LogoWrapper>
          <ProductLogo type="CDF" />
        </LogoWrapper>
        <div>
          <h3>{t(translationKeys.APP_DATA_OPS_TITLE, 'DataOps')}</h3>
          <p>
            {t(
              translationKeys.APP_DATA_OPS_SUBTITLE,
              'Data management platform'
            )}
          </p>
        </div>
      </AppSelectorItem>
    </AppSelectorWrapper>
  );
};
