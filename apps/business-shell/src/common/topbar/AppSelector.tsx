import styled from 'styled-components';

import { ProductLogo } from '@cognite/cogs.js';

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
          <h3>InField</h3>
          <p>Create and execute field operations</p>
        </div>
      </AppSelectorItem>
      <AppSelectorItem onClick={navigate('/maintain')}>
        <LogoWrapper>
          <ProductLogo type="Maintain" />
        </LogoWrapper>
        <div>
          <h3>Maintain</h3>
          <p>Plan and optimise asset maintenance</p>
        </div>
      </AppSelectorItem>
      <AppSelectorItem onClick={navigate('/inrobot')}>
        <LogoWrapper>
          <ProductLogo type="Remote" />
        </LogoWrapper>
        <div>
          <h3>InRobot</h3>
          <p>Configure and operate robots at your asset</p>
        </div>
      </AppSelectorItem>
      <AppSelectorItem onClick={navigate('https://fusion.cognite.com')}>
        <LogoWrapper>
          <ProductLogo type="CDF" />
        </LogoWrapper>
        <div>
          <h3>DataOps</h3>
          <p>Data management platform</p>
        </div>
      </AppSelectorItem>
    </AppSelectorWrapper>
  );
};
