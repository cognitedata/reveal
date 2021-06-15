import styled from 'styled-components/macro';

export const SuiteAvatarContainer = styled.div<{
  disabled?: boolean;
  color?: string;
}>`
  text-align: center;
  padding-top: 6px;
  padding-bottom: 6px;
  border-radius: 4px;
  background-color: ${({ disabled, color }) =>
    disabled ? 'var(--cogs-greyscale-grey3)' : color};
  color: ${({ disabled }) =>
    disabled ? 'var(--cogs-greyscale-grey6)' : 'var(--cogs-black)'};
`;

export const Default = styled.div`
  min-width: 32px;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
`;

export const Medium = styled.div`
  min-width: 36px;
`;

export const Large = styled.div`
  min-width: 48px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  padding-top: 14px;
  padding-bottom: 14px;
  border-radius: 0;
`;
