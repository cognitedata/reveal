import { getOrganization } from '@cognite/cdf-utilities';

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
  loginFlowId?: string,
  validLegacyProjects?: LegacyProject[]
) => {
  const loginFlowsByCluster: Record<
    string,
    { idp?: IDPResponse; legacyProjects: LegacyProject[] }
  > = {};

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

  if (loginFlowId) {
    const idp = loginInfo?.idps.find(
      ({ internalId }) => internalId === loginFlowId
    );

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

const fusionAppHosts = [
  'fusion.cognite.com',
  'staging.fusion.cognite.com',
  'next-release.fusion.cognite.com',
  // TODO: handle SAPC cluster deployment. The current solution for SAPC & Openfield
  // is by using hard-coded responses for the /_api/login_info endpoint in nginx serving Fusion.
  // See https://github.com/cognitedata/cdf-ui-hub/blob/6fdb54a8d595284a7a209b2c86da9187e8a8263d/config/kubecfg/overlays.jsonnet#L221-L249
];

const fusionDevAppHosts = [
  'dev.fusion.cogniteapp.com',
  // TODO: we likely need others here, but we default to fusion-dev
  'fusion-pr-preview.cogniteapp.com',
  'localhost:8080',
];

const whitelistedHosts = [...fusionAppHosts, ...fusionDevAppHosts];

const getApp = () => {
  const host = window.location.host;

  for (const _host of fusionAppHosts) {
    const matches = host.includes(_host);
    if (matches) {
      return 'fusion';
    }
  }

  for (const _host of fusionDevAppHosts) {
    const matches = host.includes(_host);
    if (matches) {
      return 'fusion-dev';
    }
  }

  return 'fusion-dev';
};

// Make apps explicitly require to be specified in order to use the
// dlc-service api directly instead of the proxied _api/login_info
// requests. This way we can temporarily take control of where we want
// to enforce the new logic, and default to the old logic everywhere else.
export const isWhitelistedHost = () => {
  const host = window.location.host;

  for (const _host of whitelistedHosts) {
    const matches = host.includes(_host);
    if (matches) {
      return true;
    }
  }

  return false;
};

export const getDlc = async () => {
  const organization = getOrganization();
  const app = getApp();

  const url = new URL(
    `https://app-login-configuration-lookup.cognite.ai/${app}/${organization}`
  );

  const request = new Request(url);

  try {
    const response = await fetch(request);
    const dlc = await response.json();
    if (!dlc) {
      return Promise.reject({
        status: response.status,
        body: response,
        message: 'Failed to fetch DLC',
      });
    }
    return dlc;
  } catch (error: any) {
    return Promise.reject({
      status: error?.status,
      body: error?.message || error?.body,
    });
  }
};
