import { Geometry } from '@turf/helpers';
import head from 'lodash/head';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { API_PLAYGROUND_DOMAIN } from 'constants/app';
import { NPDLayerItemResponse } from 'modules/map/types';

export interface SpatialSearchItemResponse {
  assetIds: number[];
  name: string;
  attributes: {
    head: Geometry;
  };
}

const cache: {
  getLicenses?: Promise<{ features: any; type: string }>;
  getIdemitsuLicenses?: Promise<{ features: any; type: string }>;
  getDiscoveries?: Promise<{ features: any; type: string }>;
  getFields?: Promise<{ features: any; type: string }>;
  getBlocks?: Promise<{ features: any; type: string }>;
  getQuadrants?: Promise<{ features: any; type: string }>;
  getWellbores?: Promise<{ features: any; type: string }>;
  getStructuralElements?: Promise<{ features: any; type: string }>;
  getFacilities?: Promise<{ features: any; type: string }>;
  getPipelines?: Promise<{ features: any; type: string }>;
  getWellboresExplorationActive?: Promise<{ features: any; type: string }>;
  getProspects?: Promise<{ features: any; type: string }>;
  getTrajectories?: Promise<{ features: any; type: string }>;
} = {
  getLicenses: undefined,
  getIdemitsuLicenses: undefined,
  getDiscoveries: undefined,
  getFields: undefined,
  getBlocks: undefined,
  getQuadrants: undefined,
  getWellbores: undefined,
  getStructuralElements: undefined,
  getFacilities: undefined,
  getPipelines: undefined,
  getWellboresExplorationActive: undefined,
  getProspects: undefined,
  getTrajectories: undefined,
};

export async function getFields(tenant: string) {
  if (cache.getFields) {
    return cache.getFields;
  }

  cache.getFields = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'whereoil-fields',
          attributes: ['geometry', 'dctype', 'name', 'status'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
        dctype: item.attributes.dctype,
        status: item.attributes.status,
      },
      geometry: item.attributes.geometry,
    }));
    return { features, type: 'FeatureCollection' };
  });

  return cache.getFields;
}

export async function getDiscoveries(tenant: string) {
  if (cache.getDiscoveries) {
    return cache.getDiscoveries;
  }

  cache.getDiscoveries = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'whereoil-discoveries',
          attributes: ['geometry', 'dctype', 'fieldname', 'name', 'status'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
        dctype: item.attributes.dctype,
        fieldname: item.attributes.fieldname,
        status: item.attributes.status,
      },
      geometry: item.attributes.geometry,
    }));
    return { features, type: 'FeatureCollection' };
  });

  return cache.getDiscoveries;
}

export async function getLicenses(tenant: string) {
  if (cache.getLicenses) {
    return cache.getLicenses;
  }

  cache.getLicenses = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'whereoil-licence',
          attributes: ['geometry', 'oplongname', 'name'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
        oplongname: item.attributes.oplongname,
      },
      geometry: item.attributes.geometry,
    }));

    return { features, type: 'FeatureCollection' };
  });

  return cache.getLicenses;
}

export async function getIdemitsuLicenses(tenant: string) {
  if (cache.getIdemitsuLicenses) {
    return cache.getIdemitsuLicenses;
  }

  cache.getIdemitsuLicenses = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'idemitsu-licenses',
          attributes: ['geometry', 'oplongname', 'name', 'interest'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
        oplongname: item.attributes.oplongname,
        interest: item.attributes.interest,
      },
      geometry: item.attributes.geometry,
    }));

    return { features, type: 'FeatureCollection' };
  });

  return cache.getIdemitsuLicenses;
}

export async function getBlocks(tenant: string) {
  if (cache.getBlocks) {
    return cache.getBlocks;
  }

  cache.getBlocks = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'whereoil-blocks',
          attributes: ['geometry', 'name'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
      },
      geometry: item.attributes.geometry,
    }));

    return { features, type: 'FeatureCollection' };
  });

  return cache.getBlocks;
}

export async function getQuadrants(tenant: string) {
  if (cache.getQuadrants) {
    return cache.getQuadrants;
  }

  cache.getQuadrants = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'whereoil-quadrant',
          attributes: ['geometry', 'name'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
      },
      geometry: item.attributes.geometry,
    }));

    return { features, type: 'FeatureCollection' };
  });

  return cache.getQuadrants;
}

export async function getWellbores(tenant: string) {
  if (cache.getWellbores) {
    return cache.getWellbores;
  }

  cache.getWellbores = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'whereoil-wellbores',
          attributes: ['geometry', 'name', 'type'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
        type: item.attributes.type,
      },
      geometry: item.attributes.geometry,
    }));

    return { features, type: 'FeatureCollection' };
  });

  return cache.getWellbores;
}
export async function getStructuralElements(tenant: string) {
  if (cache.getStructuralElements) {
    return cache.getStructuralElements;
  }

  cache.getStructuralElements = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'whereoil-structuralelement',
          attributes: ['geometry', 'name', 'topography'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
        topography: item.attributes.topography,
      },
      geometry: item.attributes.geometry,
    }));

    return { features, type: 'FeatureCollection' };
  });

  return cache.getStructuralElements;
}
export async function getFacilities(tenant: string) {
  if (cache.getFacilities) {
    return cache.getFacilities;
  }

  cache.getFacilities = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'whereoil-facility',
          attributes: ['geometry', 'name', 'surface'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
        surface: item.attributes.surface,
      },
      geometry: item.attributes.geometry,
    }));

    return { features, type: 'FeatureCollection' };
  });

  return cache.getFacilities;
}
export async function getPipelines(tenant: string) {
  if (cache.getPipelines) {
    return cache.getPipelines;
  }

  cache.getPipelines = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'whereoil-pipelines',
          attributes: ['geometry', 'name', 'medium', 'maplabel'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
        type: item.attributes.medium,
        label: item.attributes.maplabel,
      },
      geometry: item.attributes.geometry,
    }));

    return { features, type: 'FeatureCollection' };
  });

  return cache.getPipelines;
}
export async function getWellboresExplorationActive(tenant: string) {
  if (cache.getWellboresExplorationActive) {
    return cache.getWellboresExplorationActive;
  }

  cache.getWellboresExplorationActive = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'whereoil-wellboresexplorationactive',
          attributes: ['geometry', 'name', 'type'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
        type: item.attributes.medium,
      },
      geometry: item.attributes.geometry,
    }));

    return { features, type: 'FeatureCollection' };
  });

  return cache.getWellboresExplorationActive;
}
export async function getProspects(tenant: string) {
  if (cache.getProspects) {
    return cache.getProspects;
  }

  cache.getProspects = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'idemitsu-prospect',
          attributes: ['geometry', 'name'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
      },
      geometry: item.attributes.geometry,
    }));

    return { features, type: 'FeatureCollection' };
  });

  return cache.getProspects;
}
export async function getTrajectories(tenant: string) {
  if (cache.getTrajectories) {
    return cache.getTrajectories;
  }

  cache.getTrajectories = new Promise((resolve) => {
    // This will be replaced by spatial search sdk when its ready to fetch without limit
    const result = getCogniteSDKClient().post(
      `${API_PLAYGROUND_DOMAIN}/${tenant}/spatial/search?geometry=geojson`,
      {
        data: {
          limit: 1000,
          layer: 'idemitsu-trajectories-new',
          attributes: ['geometry', 'name'],
        },
      }
    );
    resolve(result);
  }).then((response: any) => {
    if (!response.data?.items) {
      return { features: [], type: 'FeatureCollection' };
    }

    const features = response.data.items.map((item: NPDLayerItemResponse) => ({
      type: 'Feature',
      properties: {
        name: item.attributes.name,
        id: head(item.assetIds),
      },
      geometry: item.attributes.geometry,
    }));

    return { features, type: 'FeatureCollection' };
  });

  return cache.getTrajectories;
}
