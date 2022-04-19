import styled from 'styled-components/macro';
import { sizes } from 'styles/layout';

export const SettingsContent = styled.div`
  display: flex;
  padding: 20px;
  width: 100%;
`;

export const SettingsContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 ${sizes.normal};
`;

export const LogOutButtonContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: ${sizes.medium};
`;

export const FooterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
