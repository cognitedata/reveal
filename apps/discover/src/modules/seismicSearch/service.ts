import { log } from 'utils/log';

import { isProduction } from '@cognite/react-container';
import {
  CogniteSeismicClient,
  Geometry,
  LineString,
  MultiPoint,
  GeoJson,
} from '@cognite/seismic-sdk-js';
import { GetTextHeaderResponse } from '@cognite/seismic-sdk-js/dist/cognite/seismic/protos/query_service_messages_pb';

import { SIDECAR } from 'constants/app';

import { LineProps } from './types';
import { processSegyHeader } from './utils';

const { cdfApiBaseUrl } = SIDECAR;
const CRS_CODE = 'EPSG:4230';

const sdkProps = {
  api_url: `${cdfApiBaseUrl}:443`,
  debug: !isProduction,
};

const seismicSdk = {
  client: new CogniteSeismicClient(sdkProps),
};

export const authenticateSeismicSDK = (token?: string) => {
  seismicSdk.client = new CogniteSeismicClient({
    token,
    ...sdkProps,
  });
};

export const getSeismicSDKClient = () => {
  return seismicSdk.client;
};

const test = async () => {
  const result = await getSeismicSDKClient().survey.list();
  log('result', [result]);
};

const getTextHeader = async (id: string): Promise<SeismicHeader> => {
  const result = await getSeismicSDKClient().file.getTextHeader(id);

  return processSegyHeader(result);
};

async function getSliceByGeometry(id: string, geometry: Geometry) {
  return getSeismicSDKClient().slice.getSliceByGeometry(id, geometry, CRS_CODE);
}

function getSliceByLine(id: string, iline: LineProps, xline: LineProps) {
  return getSeismicSDKClient().volume.get(
    { id },
    {
      iline,
      xline,
    }
  );
}

async function getVolumeRange(id: string) {
  return getSeismicSDKClient()
    .file.getLineRange({ id })
    .then((range) => {
      return {
        id,
        xline: { min: range.xline?.min?.value, max: range.xline?.max?.value },
        iline: { min: range.inline?.min?.value, max: range.inline?.max?.value },
      };
    });
}

function getArbitraryLine(id: string, line: GeoJson) {
  const geomentry = line.geometry as MultiPoint | LineString;
  const point1 = geomentry.coordinates[0];
  const point2 = geomentry.coordinates[1];
  return getSeismicSDKClient().slice.getArbitraryLine(
    id,
    point1[0],
    point1[1],
    point2[0],
    point2[1],
    CRS_CODE
  );
}

export type SeismicHeader = GetTextHeaderResponse.AsObject;

export const seismicService = {
  getArbitraryLine,
  getSliceByGeometry,
  getTextHeader,
  test,
  getSliceByLine,
  getVolumeRange,
};
