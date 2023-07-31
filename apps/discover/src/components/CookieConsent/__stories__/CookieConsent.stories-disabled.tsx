import { Props, CookieConsent } from '../CookieConsent';

// eslint-disable-next-line import/no-anonymous-default-export
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
