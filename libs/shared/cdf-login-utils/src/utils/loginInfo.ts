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
