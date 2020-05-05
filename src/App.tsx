import React, { useState, useCallback, useEffect } from 'react';
import { getSidecar } from 'utils';
import useTenantSelector from 'useTenantSelector';
import background from 'assets/background.jpg';
import TenantSelectorBackground from 'TenantSelectorBackground';
import I18nContainer from 'containers/I18nContainer';
import Metrics from '@cognite/metrics';
import GlobalStyles from 'global-styles';
import CardContainer from 'CardContainer/CardContainer';

const { REACT_APP_MIXPANEL_TOKEN, REACT_APP_ENV, NODE_ENV } = process.env;

const App = () => {
  const { applicationId, backgroundImage, helpLink } = getSidecar();
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
    <>
      <GlobalStyles />
      <TenantSelectorBackground backgroundImage={backgroundImage || background}>
        <I18nContainer>
          <CardContainer
            validateTenant={performValidation}
            handleSubmit={onTenantSelected}
            loading={isLoading}
            initialTenant={initialTenant || ''}
            helpLink={helpLink || ''}
          />
        </I18nContainer>
      </TenantSelectorBackground>
    </>
  );
};

export default App;
