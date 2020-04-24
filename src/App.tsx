import React, { useState, useCallback, useEffect } from 'react';
import TitleChanger from 'TitleChanger';
import { getSidecar } from 'utils';
import useTenantSelector from 'useTenantSelector';
import background from 'assets/background.jpg';
import TenantSelectorBackground from 'TenantSelectorBackground';
import TenantSelector from 'TenantSelector';
import I18nContainer from 'I18nContainer';
import Metrics from '@cognite/metrics';

const { REACT_APP_MIXPANEL_TOKEN, REACT_APP_ENV, NODE_ENV } = process.env;

const App = () => {
  const { applicationId, backgroundImage } = getSidecar();
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    Metrics.init({
      mixpanelToken: REACT_APP_MIXPANEL_TOKEN,
      environment: REACT_APP_ENV || NODE_ENV || 'development',
    });
  }, []);

  const possibleTenant = window.location.pathname.replace(
    /^\/([^/]*).*$/,
    '$1'
  );

  const {
    onTenantSelected,
    checkTenantValidity,
    validatingTenant,
    redirecting,
    initialTenant,
  } = useTenantSelector(applicationId);

  const isLoading =
    redirecting ||
    authenticating ||
    validatingTenant ||
    initialTenant === possibleTenant;

  // TODO: Set a timeout here so that we detect if we're ever in this loading
  // state for too long.

  const performValidation = useCallback(
    (tenant: string) => {
      setAuthenticating(true);
      return checkTenantValidity(tenant).finally(() => {
        setAuthenticating(false);
      });
    },
    [checkTenantValidity]
  );

  return (
    <TenantSelectorBackground backgroundImage={backgroundImage || background}>
      <I18nContainer>
        <TitleChanger />
        <TenantSelector
          validateTenant={performValidation}
          handleSubmit={onTenantSelected}
          loading={isLoading}
        />
      </I18nContainer>
    </TenantSelectorBackground>
  );
};

export default App;
