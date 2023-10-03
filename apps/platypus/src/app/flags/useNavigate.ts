import {
  To,
  NavigateOptions,
  useNavigate as origUseNavigate,
} from 'react-router-dom';

import queryString from 'query-string';

import { createLink, getProject } from '@cognite/cdf-utilities';

import { environment } from '../../environments/environment';

export const useNavigate = () => {
  const origNavigate = origUseNavigate();
  const project = getProject();

  return (to: To, options?: NavigateOptions) => {
    const fdmV3Path = 'data-models';
    let newToUrl = typeof to === 'string' ? to : to.pathname;
    if (newToUrl) {
      newToUrl = `/${fdmV3Path}${
        newToUrl.startsWith('/') ? '' : '/'
      }${newToUrl}`;
    }

    const { url, query: params } = queryString.parseUrl(newToUrl || '/');

    let generatedLink = createLink(
      url,
      {
        ...queryString.parse(window.location.search),
        ...params,
      },
      undefined
    );

    if (
      environment.APP_ENV !== 'preview' &&
      generatedLink.includes('/' + project)
    ) {
      generatedLink = generatedLink.replace('/' + project, '');
    }
    origNavigate(generatedLink, options);
  };
};
