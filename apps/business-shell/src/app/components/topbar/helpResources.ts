import { IconType } from '@cognite/cogs.js';

import { TranslationKeys } from '../../common';

export type HelpResource = {
  title: string;
  icon: IconType;
  link: string;
};

export const getHelpDropdownOptions = (
  _t: (key: TranslationKeys) => string
) => {
  const helpOptions: Record<string, HelpResource> = {
    'help-documentation': {
      title: _t('VIEW_DOCUMENTATION'),
      icon: 'Documentation',
      link: 'https://docs.cognite.com/cdf/dashboards/',
    },
    'help-whats-new': {
      title: _t('WHATS_NEW'),
      icon: 'Speakerphone',
      link: 'https://docs.cognite.com/cdf/whatsnew',
    },
    'help-learn-at-academy': {
      title: _t('LEARN_AT_ACADEMY'),
      icon: 'Certificate',
      link: 'https://learn.cognite.com/',
    },
    'help-ask-community': {
      title: _t('ASK_THE_COMMUNITY'),
      icon: 'Users',
      link: 'https://hub.cognite.com/',
    },
    'help-product-status': {
      title: _t('CHECK_THE_PRODUCT_STATUS'),
      icon: 'BarChart',
      link: 'https://status.cognite.com/',
    },
    'help-contact-support': {
      title: _t('CONTACT_SUPPORT'),
      icon: 'Feedback',
      link: 'https://cognite.zendesk.com/hc/en-us/requests/new',
    },
  };

  return helpOptions;
};
