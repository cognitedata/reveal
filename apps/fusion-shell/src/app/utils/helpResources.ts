import { IconType } from '@cognite/cogs.js';

import { TranslationKeys } from '../../i18n';

export const getSubAppName = () => {
  const subAppUrl = new URL(window.location.href);
  return subAppUrl.pathname.split('/')[2];
};

export type helpCenterResourceType = {
  title: string;
  icon: IconType;
  subtitle: string;
  link: string;
};

export type learningResourceType = {
  subtitle: string;
  title: string;
  link: string;
};

export const getHelpCenterOptions = (
  _t: (key: TranslationKeys) => string,
  isRockwellDomain: boolean,
  filterOptions?: string[]
) => {
  let selHelpCenterOptions: Record<string, helpCenterResourceType> = {};
  const allHelpCenterOptions: Record<string, helpCenterResourceType> = {
    'help-documentation': {
      title: _t('help-documentation'),
      icon: 'Documentation',
      subtitle: _t('help-documentation-desc'),
      link: 'https://docs.cognite.com/cdf/',
    },
    'help-whats-new': {
      title: _t('help-whats-new'),
      icon: 'Speakerphone',
      subtitle: '',
      link: 'https://docs.cognite.com/cdf/whatsnew',
    },
    'help-learn-at-academy': {
      title: _t('help-learn-at-academy'),
      icon: 'Certificate',
      subtitle: _t('help-learn-at-academy-desc'),
      link: 'https://learn.cognite.com/',
    },
    'help-ask-community': {
      title: _t('help-ask-community'),
      icon: 'Users',
      subtitle: _t('help-ask-community-desc'),
      link: 'https://hub.cognite.com/',
    },
    'help-product-status': {
      title: _t('help-product-status'),
      icon: 'BarChart',
      subtitle: '',
      link: 'https://status.cognite.com/',
    },
    'help-contact-support': {
      title: _t('help-contact-support'),
      icon: 'Feedback',
      subtitle: '',
      link: isRockwellDomain
        ? 'https://rockwellautomation.custhelp.com/app/ask/p/6133'
        : 'https://cognite.zendesk.com/hc/en-us/requests/new',
    },
  };

  if (filterOptions && filterOptions?.length) {
    for (const optionKey in allHelpCenterOptions) {
      if (filterOptions.includes(optionKey))
        selHelpCenterOptions[optionKey] =
          allHelpCenterOptions[optionKey as keyof typeof allHelpCenterOptions];
    }

    return selHelpCenterOptions;
  }

  return allHelpCenterOptions;
};

export const getLearningResources = (_t: (key: TranslationKeys) => string) => {
  const learningResources: Record<string, learningResourceType> = {
    documentation: {
      title: _t('title-documentation'),
      subtitle: _t('title-documentation-prefix'),
      link: 'https://docs.cognite.com/cdf/',
    },
    'api-documentation': {
      title: _t('title-api-documentation'),
      subtitle: _t('title-documentation-prefix'),
      link: 'https://docs.cognite.com/api/v1/',
    },
    'cognite-hub': {
      title: _t('title-cognite-hub'),
      subtitle: _t('title-cognite-hub-prefix'),
      link: 'https://hub.cognite.com/',
    },
    'cognite-academy': {
      title: _t('title-cognite-academy'),
      subtitle: _t('title-cognite-academy-prefix'),
      link: 'https://learn.cognite.com/',
    },
    'whats-new': {
      title: _t('title-whats-new'),
      subtitle: _t('title-whats-new-prefix'),
      link: 'https://docs.cognite.com/cdf/whatsnew',
    },
  };

  return { learningResources };
};
