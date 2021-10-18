import styled from 'styled-components/macro';

export const SettingsItem = styled.div`
  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export const Content = styled.div`
  width: 256px;
`;

export const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  height: 52px;
  align-items: center;
  padding: 8px;
`;

export const SettingsContent = styled.div`
  padding: 18px 8px;
`;
