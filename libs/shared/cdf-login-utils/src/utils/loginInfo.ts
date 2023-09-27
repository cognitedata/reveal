import {
  DomainResponse,
  IDPResponse,
  LegacyProject,
  ValidatedLegacyProject,
} from '../types';

export const getLegacyProjectsByCluster = (
  legacyProjects?: LegacyProject[]
) => {
  const legacyProjectsByCluster: Record<string, LegacyProject[]> = {};
  legacyProjects?.forEach((legacyProject) => {
    if (!legacyProjectsByCluster[legacyProject.cluster]) {
      legacyProjectsByCluster[legacyProject.cluster] = [];
    }
    legacyProjectsByCluster[legacyProject.cluster].push(legacyProject);
  });

  return legacyProjectsByCluster;
};

const getValidLegacyProjectsInLoginFlows = (
  loginFlowsByCluster: Record<
    string,
    { idp?: IDPResponse; legacyProjects: LegacyProject[] }
  >,
  validLegacyProjects: LegacyProject[]
) => {
  let validatedLoginFlowsByCluster: Record<
    string,
    { idp?: IDPResponse; legacyProjects: LegacyProject[] }
  > = {};

  Object.keys(loginFlowsByCluster).forEach((cluster) => {
    validatedLoginFlowsByCluster[cluster] = {
      ...loginFlowsByCluster[cluster],
      legacyProjects: [],
    };
    loginFlowsByCluster[cluster].legacyProjects.forEach((legacyProject) => {
      const isValidProject = validLegacyProjects.find(
        (validLegacyProject) =>
          legacyProject.cluster === validLegacyProject.cluster &&
          legacyProject.projectName === validLegacyProject.projectName
      );
      if (isValidProject) {
        validatedLoginFlowsByCluster[cluster].legacyProjects.push(
          legacyProject
        );
      }
    });
  });

  return validatedLoginFlowsByCluster;
};

export const getLoginFlowsByCluster = (
  loginInfo?: DomainResponse,
  idp?: IDPResponse,
  validLegacyProjects?: LegacyProject[]
) => {
  const loginFlowsByCluster: Record<
    string,
    { idp?: IDPResponse; legacyProjects: LegacyProject[] }
  > = {};

  // For CogIdp, it's the same IdP for all login flows.
  if (idp?.type === 'COGNITE_IDP') {
    idp.clusters.forEach((cluster) => {
      loginFlowsByCluster[cluster] = {
        idp,
        legacyProjects: [],
      };
    });
    return loginFlowsByCluster;
  }

  const legacyProjectsByCluster = getLegacyProjectsByCluster(
    loginInfo?.legacyProjects
  );
  Object.keys(legacyProjectsByCluster).forEach((cluster) => {
    if (!loginFlowsByCluster[cluster]) {
      loginFlowsByCluster[cluster] = {
        legacyProjects: [],
      };
    }
    loginFlowsByCluster[cluster].legacyProjects =
      legacyProjectsByCluster[cluster];
  });

  if (idp) {
    idp?.clusters.forEach((idpCluster) => {
      if (!loginFlowsByCluster[idpCluster]) {
        loginFlowsByCluster[idpCluster] = { legacyProjects: [] };
      }
      loginFlowsByCluster[idpCluster].idp = idp;
    });
  }

  if (validLegacyProjects?.length && Object.keys(loginFlowsByCluster)?.length) {
    return getValidLegacyProjectsInLoginFlows(
      loginFlowsByCluster,
      validLegacyProjects
    );
  }

  return loginFlowsByCluster;
};

export const validateLegacyProject = (
  legacyProject: LegacyProject
): Promise<ValidatedLegacyProject> => {
  const { cluster, projectName } = legacyProject;
  const queryParams = new URLSearchParams({
    app: 'cdf',
    project: projectName,
    redirectUrl: window.location.origin,
  });

  return fetch(`https://${cluster}/login/redirect?${queryParams}`, {
    redirect: 'manual',
  })
    .then((response) => {
      const { status, type } = response;
      if (type === 'opaqueredirect') {
        return { ...legacyProject, isValid: true };
      }
      // Check: If project can be invalid for any other reason/err code
      if (status === 400) {
        return { ...legacyProject, isValid: false };
      } else {
        return { ...legacyProject, isValid: false };
      }
    })
    .catch(() => {
      return { ...legacyProject, isValid: false };
    });
};

export const groupLegacyProjectsByValidationStatus = (
  validatedLegacyProjects: ValidatedLegacyProject[] = []
): {
  validLegacyProjects: ValidatedLegacyProject[];
  invalidLegacyProjects: ValidatedLegacyProject[];
} => {
  const { validLegacyProjects, invalidLegacyProjects } =
    validatedLegacyProjects.reduce(
      (acc, cur) => {
        if (cur.isValid) {
          acc.validLegacyProjects.push(cur);
        } else {
          acc.invalidLegacyProjects.push(cur);
        }
        return acc;
      },
      {
        validLegacyProjects: [] as ValidatedLegacyProject[],
        invalidLegacyProjects: [] as ValidatedLegacyProject[],
      }
    );

  return { validLegacyProjects, invalidLegacyProjects };
};

export const sortLegacyProjectsByName = (legacyProjects?: LegacyProject[]) => {
  return (legacyProjects ?? []).sort(
    (projectA: LegacyProject, projectB: LegacyProject) => {
      const projectNameA = (projectA.projectName ?? '').toLocaleLowerCase();
      const projectNameB = (projectB.projectName ?? '').toLocaleLowerCase();
      if (projectNameA < projectNameB) return -1;
      if (projectNameA > projectNameB) return 1;
      return 0;
    }
  );
};

export const sortIDPsByLabel = (idps?: IDPResponse[]) => {
  return (idps ?? []).sort((idpA: IDPResponse, idpB: IDPResponse) => {
    const idpLabelA = (idpA.label ?? '').toLocaleLowerCase();
    const idpLabelB = (idpB.label ?? '').toLocaleLowerCase();
    if (idpLabelA < idpLabelB) return -1;
    if (idpLabelA > idpLabelB) return 1;
    return 0;
  });
};

type FusionDomain = {
  baseHostname: string; // the hostname without the org subdomain, but not neccessary the _direct_ parent domain
  orgPattern?: RegExp; // regex to match to extract the organization. default: first subdomain
};

const fusionAppHosts: FusionDomain[] = [
  { baseHostname: 'fusion.cognite.com' },
  { baseHostname: 'staging.fusion.cognite.com' },
  { baseHostname: 'next-release.fusion.cognite.com' },
];

const fusionDevAppHosts: FusionDomain[] = [
  { baseHostname: 'dev.fusion.cogniteapp.com' },
  { baseHostname: 'fusion-pr-preview.cogniteapp.com' },
  { baseHostname: 'local.cognite.ai' },
  { baseHostname: 'localhost' },
  { baseHostname: 'fusion.cognitedata-development.cognite.ai' },
  {
    baseHostname: 'fusion-preview.preview.cogniteapp.com',
    orgPattern:
      /([^.]+)\.fusion-shell-[\d]+\.fusion-preview\.preview\.cogniteapp\.com/,
  },
];

const whitelistedHosts = [...fusionAppHosts, ...fusionDevAppHosts];

const isAnyOfHosts = (hostname: string, baseHostnames: string[]) => {
  return baseHostnames.some((_host) => hostname.endsWith(_host));
};

const getBaseHostnameFromDomain = ({ baseHostname }: FusionDomain) =>
  baseHostname;

export const getApp = () => {
  const hostname = window.location.hostname;

  if (isAnyOfHosts(hostname, fusionAppHosts.map(getBaseHostnameFromDomain))) {
    return 'fusion';
  }

  return 'fusion-dev';
};

// Make apps explicitly require to be specified in order to use the
// dlc-service api directly instead of hardcoded responses.
// See the variable [hardcodedDlcResponses].
export const isAllowlistedHost = () => {
  const hostname = window.location.hostname;
  return isAnyOfHosts(
    hostname,
    whitelistedHosts.map(getBaseHostnameFromDomain)
  );
};

export const getOrganization = (): string | null => {
  const hostname = window.location.hostname;

  // ensure e.g. next-release.fusion.cognite.com isn't
  // interpreted as the app fusion.cognite.com with
  // the organization "next-release"
  if (whitelistedHosts.map(getBaseHostnameFromDomain).includes(hostname)) {
    return null;
  }

  for (const { baseHostname, orgPattern } of whitelistedHosts) {
    if (!hostname.endsWith(baseHostname)) {
      continue;
    }
    if (orgPattern) {
      return hostname.match(orgPattern)?.[1] ?? null;
    }
    return hostname.split('.')[0];
  }
  return null;
};

export const getBaseHostname = (): string => {
  const noOrganizationSpecified = !getOrganization();
  if (noOrganizationSpecified) {
    return window.location.hostname;
  } else {
    return window.location.hostname.split('.').slice(1).join('.');
  }
};

export const getBaseUrl = (): string => {
  const baseHostnameWithProtocol = `${
    window.location.protocol
  }//${getBaseHostname()}`;
  const { port } = window.location;
  if (port) {
    return `${baseHostnameWithProtocol}:${port}`;
  }
  return baseHostnameWithProtocol;
};

const hardcodedDlcResponses: Record<string, DomainResponse> = {
  openfield: {
    domain: 'cog-adfs2016',
    idps: [
      {
        appConfiguration: { clientId: 'openfield-fusion' },
        authority: 'https://test.ad2016-test.cognite.ai/adfs/oauth2',
        clusters: ['openfield.cognitedata.com'],
        hasDefaultApps: false,
        internalId: '8773f5c6-ee51-4851-8791-bbb503e270b7',
        label: 'Internal ADFS2016 test server',
        type: 'ADFS2016',
      },
    ],
    internalId: '6f3eeac2-2057-418c-8231-87646fb9fc61',
    label: 'Internal Cognite ADFS2016 test environment',
    legacyProjects: [],
  },
  'sapc-01': {
    domain: 'sacp-01',
    idps: [
      {
        appConfiguration: {
          clientId: 'd8ffced7-fc69-4b76-abd6-83bd19e38f5a',
        },
        authority: 'https://partners.aramco.com/adfs/oauth2',
        clusters: ['api-cdf.sapublichosting.com'],
        hasDefaultApps: false,
        internalId: '1d3b94eb-eeaf-4338-afeb-9dc8523c2134',
        label: 'Sign in with Microsoft',
        type: 'ADFS2016',
      },
    ],
    internalId: 'b4ab319b-6474-434c-b939-affb3c0a2ee8',
    label: 'Saudi Aramco Extended Private Cloud',
    legacyProjects: [],
  },
};

export const getDlc = async (): Promise<DomainResponse> => {
  // check for clusters not supported by DLC (Aramco & OpenField)
  if (isAllowlistedHost()) {
    const organization = getOrganization();
    const app = getApp();
    if (!organization) {
      throw new Error('Organization not found');
    }
    const response = await fetch(
      `https://app-login-configuration-lookup.cognite.ai/${app}/${organization}`
    );
    const dlc = await response.json();
    if (!response.ok) {
      throw dlc;
    }
    return dlc;
  }

  const { hostname } = window.location;
  const openfieldHostname = 'fusion-apps.apps.ocp.cognite.c.bitbit.net';
  if (hostname.endsWith(openfieldHostname)) {
    return hardcodedDlcResponses.openfield;
  }

  // if not whitelisted nor openfield, we assume it's the Aramco cluster
  return hardcodedDlcResponses['sapc-01'];
};

const getOrgCookieName = (hostname: string) =>
  `loginOrg-${encodeURIComponent(hostname)}`;

export function setLoginOrganizationCookie(org: string) {
  const baseHostname = getBaseHostname();
  const expiresInMinutes = 10;
  const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  document.cookie = `${getOrgCookieName(
    baseHostname
  )}=${org};domain=${baseHostname};expires=${expires.toUTCString()}`;
}

function getCookieValue(name: string): string {
  return (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
  );
}

function getOrganizationCookie(): string | null {
  const baseHostname = getBaseHostname();
  const org = getCookieValue(getOrgCookieName(baseHostname));
  return org !== '' ? org : null;
}

export function handleSigninCallback() {
  const org = getOrganizationCookie();
  if (!org) {
    throw new Error('No organization found');
  }
  const redirectTo = new URL(window.location.href);
  redirectTo.pathname = '/';
  redirectTo.hostname = `${org}.${redirectTo.hostname}`;
  window.location.href = redirectTo.href;
}
