import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const UserProfileContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 ${sizes.normal};
`;

export const AvatarAndEmailContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const EmailContainer = styled.p`
  line-height: 20px;
  color: var(--cogs-greyscale-grey6);
  margin-top: 15px;
  margin-bottom: 24px;
`;

export const InputFieldContainer = styled.div`
  width: 100%;
  margin-bottom: 16px;

  .input-wrapper,
  input {
    width: 100%;
  }
`;

export const CompanyInfoContainer = styled.div`
  height: 36px;
  display: flex;
  align-items: center;

  img {
    margin-right: 8px;
    height: 24px;
  }
`;

export const LogOutButtonContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: ${sizes.medium};
`;

export const CompanyLabel = styled.div`
  font-size: var(--cogs-b2-font-size);
  line-height: var(--cogs-b2-line-height);
  font-weight: 500;
  color: var(--cogs-greyscale-grey8);
  margin-bottom: 4px;
`;

export const UserProfileFooterContainer = styled.div`
  height: 48px;
  background: var(--cogs-greyscale-grey2);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const VersionWrapper = styled.div`
  margin-left: 8px;
  color: var(--cogs-greyscale-grey10);
`;
