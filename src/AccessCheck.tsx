import { ReactNode } from 'react';

import { Icons, Loader } from '@cognite/cogs.js';
import styled from 'styled-components';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { useTranslation } from 'common/i18n';

type AccessCheckProps = {
  children: ReactNode;
};

const AccessCheck = ({ children }: AccessCheckProps): JSX.Element => {
  const { t } = useTranslation();
  const { flow } = getFlow();
  const { data: hasReadAccess, isFetched } = usePermissions(
    flow,
    'datasetsAcl',
    'READ'
  );

  if (!isFetched) {
    return <Loader />;
  }

  if (!hasReadAccess) {
    return (
      <NoAccessContent>
        <Warning>
          <Icons.WarningFilled />
          <div>{t('access-check-insufficient-access-rights')}</div>
        </Warning>
        <Instructions>{t('access-check-instructions')}</Instructions>
        <AccessInfoWrapper className="z-4">
          <AccessInfo>
            <p>
              {t('access-check-info-1-p1')} <strong>groups:list</strong>{' '}
              {t('access-check-info-1-p2')}
            </p>
            <p>
              {t('access-check-info-2-p1')} <strong>data-sets:read</strong>.
            </p>
            <p>
              {t('access-check-info-2-p2')} <strong>data-sets:write</strong>.
            </p>
          </AccessInfo>
        </AccessInfoWrapper>
      </NoAccessContent>
    );
  }

  return <>{children}</>;
};

export default AccessCheck;

const NoAccessContent = styled.div`
  margin: 80px 50px;
`;

const Warning = styled.div`
  font-size: 16px;
  color: var(--cogs-yellow-1);
  font-weight: bold;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  svg {
    margin-right: 1em;
  }
`;

const Instructions = styled.div`
  margin-bottom: 28px;
`;

const AccessInfoWrapper = styled.div`
  background-color: white;
  padding: 14px;
  margin: 14px;
  border-radius: 4px;
`;

const AccessInfo = styled.div`
  color: var(--cogs-text-color);
  padding: 7px 14px;
  width: 100%;
  p:last-child {
    margin-bottom: 0;
  }
  strong {
    font-weight: bold;
  }
`;
