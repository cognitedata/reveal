import {
  getEnv,
  createLink,
  checkUrl,
  Envs,
  getProject,
  isUsingUnifiedSignin,
  getOrganization,
} from './utils';

describe('Utils', () => {
  describe('checkUnifiedSignin', () => {
    global.window ??= Object.create(window);

    it('Should return false when app is served from fusion domains', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: 'https://dev.fusion.cogniteapp.com/test-project',
          pathname: '/test-project',
          hostname: 'dev.fusion.cogniteapp.com',
          host: 'dev.fusion.cogniteapp.com',
        },
      });
      expect(isUsingUnifiedSignin()).toBe(false);
    });

    it('Should return true if app is served from sign-in domains', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: 'https://apps-staging.cognite.com/cdf/test-project',
          pathname: '/cdf/test-project',
          hostname: 'apps-staging.cognite.com',
          host: 'apps-staging.cognite.com',
        },
      });
      expect(isUsingUnifiedSignin()).toBe(true);
    });
  });

  describe('getEnv', () => {
    global.window ??= Object.create(window);
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        search: '',
      },
    });

    it('Should return empty string if there is no env', () => {
      expect(getEnv()).toBe('');
    });

    it('Should return a string if the env is defined', () => {
      global.window.location.search = '?env=greenfield';
      expect(getEnv()).toBe('greenfield');
    });

    it('Should return only the env variable', () => {
      global.window.location.search = '?other=value&env=greenfield';
      expect(getEnv()).toBe('greenfield');
    });
  });

  describe('createLink', () => {
    const tenant = 'some-tenant';
    global.window ??= Object.create(window);

    it('should include the tenant', () => {
      Object.defineProperty(window, 'location', {
        writable: true,

        value: {
          href: `https://domain/${tenant}`,
          pathname: `/${tenant}`,
          search: '',
        },
      });

      expect(createLink('/')).toEqual('/some-tenant');
      expect(createLink('/feature')).toEqual('/some-tenant/feature');
    });

    it('should deal with trailing slashes', () => {
      Object.defineProperty(window, 'location', {
        writable: true,

        value: {
          href: `https://domain/${tenant}/`,
          pathname: `/${tenant}/`,
          search: '',
        },
      });

      expect(createLink('/')).toEqual('/some-tenant');
      expect(createLink('/feature')).toEqual('/some-tenant/feature');
    });

    it('should include the current environment', () => {
      Object.defineProperty(window, 'location', {
        writable: true,

        value: {
          href: `https://domain/${tenant}/`,
          pathname: `/${tenant}/`,
          search: '?env=greenfield',
        },
      });

      expect(createLink('/')).toEqual('/some-tenant/?env=greenfield');
      expect(createLink('/feature')).toEqual(
        '/some-tenant/feature?env=greenfield'
      );
    });

    it('should only include the current environment', () => {
      Object.defineProperty(window, 'location', {
        writable: true,

        value: {
          href: `https://domain/${tenant}/`,
          pathname: `/${tenant}/`,
          search: '?env=greenfield&query=foo',
        },
      });

      expect(createLink('/')).toEqual('/some-tenant/?env=greenfield');
      expect(createLink('/feature')).toEqual(
        '/some-tenant/feature?env=greenfield'
      );
    });

    it('should serialize the given queries the current environment', () => {
      Object.defineProperty(window, 'location', {
        writable: true,

        value: {
          href: `https://domain/${tenant}/`,
          pathname: `/${tenant}/`,
          search: '',
        },
      });

      expect(createLink('/', { a: 42 })).toEqual('/some-tenant/?a=42');
      expect(createLink('/feature', { a: 42 })).toEqual(
        '/some-tenant/feature?a=42'
      );
      expect(createLink('/feature', { a: 42, q: 'mostly harmless' })).toEqual(
        '/some-tenant/feature?a=42&q=mostly%20harmless'
      );
    });

    it('should ignore the existing queries', () => {
      Object.defineProperty(window, 'location', {
        writable: true,

        value: {
          href: `https://domain/${tenant}/`,
          pathname: `/${tenant}/`,
          search: '?foo=bar',
        },
      });

      expect(createLink('/', { a: 42 })).toEqual('/some-tenant/?a=42');
      expect(createLink('/feature', { a: 42 })).toEqual(
        '/some-tenant/feature?a=42'
      );
      expect(createLink('/feature', { a: 42, q: 'mostly harmless' })).toEqual(
        '/some-tenant/feature?a=42&q=mostly%20harmless'
      );
    });

    it('should not overwrite or skip env', () => {
      Object.defineProperty(window, 'location', {
        writable: true,

        value: {
          href: `https://domain/${tenant}/`,
          pathname: `/${tenant}/`,
          search: '?env=greenfield',
        },
      });

      expect(createLink('/', { a: 42 })).toEqual(
        '/some-tenant/?a=42&env=greenfield'
      );
      expect(createLink('/feature', { a: 42 })).toEqual(
        '/some-tenant/feature?a=42&env=greenfield'
      );
      expect(createLink('/feature', { a: 42, q: 'mostly harmless' })).toEqual(
        '/some-tenant/feature?a=42&env=greenfield&q=mostly%20harmless'
      );
    });

    it('should not be possible to overwrite env via queries', () => {
      Object.defineProperty(window, 'location', {
        writable: true,

        value: {
          href: `https://domain/${tenant}/`,
          pathname: `/${tenant}/`,
          search: '?env=greenfield',
        },
      });

      expect(createLink('/feature', { env: 'sandfield' })).toEqual(
        '/some-tenant/feature?env=greenfield'
      );
    });

    it('should accept query-string stringify options', () => {
      Object.defineProperty(window, 'location', {
        writable: true,

        value: {
          href: `https://domain/${tenant}/`,
          pathname: `/${tenant}/`,
        },
      });

      expect(createLink('/feature', { cart: ['a', 'b'] })).toEqual(
        '/some-tenant/feature?cart=a&cart=b'
      );

      expect(
        createLink('/feature', { cart: ['a', 'b'] }, { arrayFormat: 'comma' })
      ).toEqual('/some-tenant/feature?cart=a,b');

      expect(
        createLink(
          '/feature',
          { cart: ['a', 'b'] },
          { arrayFormat: 'separator', arrayFormatSeparator: '|' }
        )
      ).toEqual('/some-tenant/feature?cart=a|b');
    });

    it('should append project, cluster, organization, env when unified-signin', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: 'https://apps-staging.cognite.com/cdf/test-project?project=test-project&cluster=greenfield.cognitedata.com&idpInternalId=a5bc6507-2644-4004-87eb-efdb3124e3e2&organization=cog-appdev',
          pathname: '/cdf/test-project',
          hostname: 'apps-staging.cognite.com',
          host: 'apps-staging.cognite.com',
          search:
            '?project=test-project&cluster=greenfield.cognitedata.com&idpInternalId=a5bc6507-2644-4004-87eb-efdb3124e3e2&organization=cog-appdev',
        },
      });

      expect(createLink('/data-models', { env: 'sandfield' })).toEqual(
        '/cdf/test-project/data-models?cluster=greenfield.cognitedata.com&env=sandfield&idpInternalId=a5bc6507-2644-4004-87eb-efdb3124e3e2&organization=cog-appdev&project=test-project'
      );
    });

    it('Should not duplicate project when unified signin', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: 'https://apps-staging.cognite.com/cdf/test-project?project=test-project&cluster=greenfield.cognitedata.com&idpInternalId=a5bc6507-2644-4004-87eb-efdb3124e3e2&organization=cog-appdev',
          pathname: '/cdf/test-project',
          hostname: 'apps-staging.cognite.com',
          host: 'apps-staging.cognite.com',
          search:
            '?project=test-project&cluster=greenfield.cognitedata.com&idpInternalId=a5bc6507-2644-4004-87eb-efdb3124e3e2&organization=cog-appdev',
        },
      });

      expect(
        createLink('/test-project/data-models', { env: 'sandfield' })
      ).toEqual(
        '/cdf/test-project/data-models?cluster=greenfield.cognitedata.com&env=sandfield&idpInternalId=a5bc6507-2644-4004-87eb-efdb3124e3e2&organization=cog-appdev&project=test-project'
      );

      expect(
        createLink('/cdf/test-project/data-models', { env: 'sandfield' })
      ).toEqual(
        '/cdf/test-project/data-models?cluster=greenfield.cognitedata.com&env=sandfield&idpInternalId=a5bc6507-2644-4004-87eb-efdb3124e3e2&organization=cog-appdev&project=test-project'
      );
    });
  });

  describe('checkUrl', () => {
    global.window ??= Object.create(window);

    it('Should correctly recognize env from URL as dev', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'dev.fusion.cogniteapp.com',
        },
      });
      expect(checkUrl(Envs.DEV)).toBe(true);
    });

    it('Should correctly recognize env from URL as next-release', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'next-release.fusion.cognite.com',
        },
      });
      expect(checkUrl(Envs.NEXT_RELEASE)).toBe(true);
    });

    it('Should correctly recognize env from URL as prod', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'fusion.cognite.com',
        },
      });
      expect(checkUrl(Envs.PROD)).toBe(true);
    });

    it('Should correctly recognize env from URL as dev, when organization is a part of URL', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'devon.dev.fusion.cogniteapp.com',
        },
      });
      expect(checkUrl(Envs.DEV)).toBe(true);
    });

    it('Should correctly recognize env from URL as next-release, when organization is a part of URL', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'devon.next-release.fusion.cognite.com',
        },
      });
      expect(checkUrl(Envs.NEXT_RELEASE)).toBe(true);
      expect(checkUrl(Envs.DEV)).toBe(false);
    });

    it('Should correctly recognize env from URL as prod, when organization is a part of URL', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'devon.fusion.cognite.com',
        },
      });
      expect(checkUrl(Envs.PROD)).toBe(true);
      expect(checkUrl(Envs.DEV)).toBe(false);
    });
  });

  describe('checkProject', () => {
    global.window ??= Object.create(window);

    it('Should correctly recognize project from URL', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: 'https://dev.fusion.cogniteapp.com/test-project',
          pathname: '/test-project',
          hostname: 'dev.fusion.cogniteapp.com',
        },
      });
      expect(getProject()).toBe('test-project');
    });
    it('Should correctly recognize project from URL when subapp', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: 'https://dev.fusion.cogniteapp.com/test-project/data-explorer',
          pathname: '/test-project',
          hostname: 'dev.fusion.cogniteapp.com',
        },
      });
      expect(getProject()).toBe('test-project');
    });
    it('Should correctly recognize project from URL when unified signin', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: 'https://apps-staging.cognite.com/cdf/test-project?env=greenfield',
          pathname: '/cdf/test-project',
          hostname: 'apps-staging.cognite.com',
          host: 'apps-staging.cognite.com',
        },
      });
      expect(getProject()).toBe('test-project');
    });
  });

  describe('checkOrganization', () => {
    global.window ??= Object.create(window);

    it('Should correctly recognize organization from sub domain', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: 'https://cog-appdev.fusion.cogniteapp.com/test-project',
          pathname: '/test-project',
          hostname: 'cog-appdev.fusion.cogniteapp.com',
        },
      });
      expect(getOrganization()).toBe('cog-appdev');
    });
    it('Should correctly recognize organization when in URL as query string param', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: 'https://apps-staging.cognite.com/cdf/test-project?project=test-project&cluster=greenfield.cognitedata.com&idpInternalId=a5bc6507-2644-4004-87eb-efdb3124e3e2&organization=cog-appdev',
          pathname: '/cdf/test-project',
          hostname: 'apps-staging.cognite.com',
          host: 'apps-staging.cognite.com',
          search:
            '?project=test-project&cluster=greenfield.cognitedata.com&idpInternalId=a5bc6507-2644-4004-87eb-efdb3124e3e2&organization=cog-appdev',
        },
      });
      expect(getOrganization()).toBe('cog-appdev');
    });
  });
});
