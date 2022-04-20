import * as React from 'react';
import { useDispatch } from 'react-redux';

import { CookieConsent as CookieConsentComponent } from 'components/cookie-consent';
import { initializeConsent, setConsent } from 'modules/user/actions';
import { useUserHasGivenConsent } from 'modules/user/selectors';

export const CookieConsent: React.FC = () => {
  const dispatch = useDispatch();
  const [showConsentRequest, setShowConsentRequest] = React.useState(false);
  const hasGivenConsent = useUserHasGivenConsent();

  const handleSetConsent = () => {
    dispatch(setConsent());
  };

  React.useEffect(() => {
    dispatch(initializeConsent());
  }, []);

  React.useEffect(() => {
    setShowConsentRequest(hasGivenConsent === false);
  }, [hasGivenConsent]);

  // we specifically check if 'hasGivenConsent' false, because it is undefined in the beginning until we check the localStorage
  if (showConsentRequest) {
    return <CookieConsentComponent onAccept={handleSetConsent} />;
  }

  return null;
};

export default CookieConsent;
