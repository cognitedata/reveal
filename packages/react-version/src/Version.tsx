import * as React from 'react';
import { Graphic } from '@cognite/cogs.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { fetchGet } from './fetch';

const useVersion = () => {
  const [version, setVersion] = React.useState('');

  const handleRawResponse = (response: Response) => {
    setVersion(response.headers.get('x-cognite-fas-version') || '');
  };

  React.useEffect(() => {
    // try and get version headers:
    fetchGet(window.location.origin, {
      mode: 'no-cors',
      headers: {},
      handleRawResponse,
    });
  }, []);

  return version;
};

const VersionWrapper = styled.div`
  margin-left: 8px;
  color: var(--cogs-greyscale-grey10);
`;

export const Version: React.FC = () => {
  const version = useVersion();
  const { t } = useTranslation('general');

  return (
    <>
      <Graphic
        type="Cognite"
        style={{
          width: 32,
          height: 19,
        }}
      />
      <VersionWrapper>
        <div className="cogs-micro" aria-label="Version">
          {t('Version')} {version}
        </div>
      </VersionWrapper>
    </>
  );
};
