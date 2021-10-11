import { Props, CookieConsent } from '../CookieConsent';

export default {
  title: 'shared/cookieConsent',
  component: CookieConsent,
  // argTypes: { onAccept: { action: 'clicked' } }
};

const props: Props = {
  onAccept: jest.fn(),
};

export const Base = (extraProps?: Props) => {
  return <CookieConsent {...props} {...extraProps} />;
};
