import sdk from '@cognite/cdf-sdk-singleton';
import { CogniteClient, IdEither } from '@cognite/sdk';
import { projectName, getCdfEnvFromUrl } from 'utils/config';

const useLocalApi = false; // Toggle on if using api locally

const getBaseURL = () => {
  const cluster = getCdfEnvFromUrl();
  if (useLocalApi) return 'http://localhost:8001';
  if (cluster) return `https://context-service.${cluster}.cognite.ai`;
  return `https://context-service.cognite.ai`;
};

class ContextServiceApi {
  private get = async <T>(route: string) => {
    const { data } = await (sdk as CogniteClient).get<T>(
      `${getBaseURL()}${route}`,
      {
        withCredentials: true,
        headers: {
          'x-cdp-project': projectName(),
        },
      }
    );
    return data;
  };

  // Not used yet
  // private post = async <R, B>(route: string, body: B) => {
  //   const { data } = await (sdk as CogniteClient).post<R>(
  //     `${getBaseURL()}${route}`,
  //     {
  //       data: body,
  //       withCredentials: true,
  //       headers: {
  //         'x-cdp-project': projectName(),
  //       }
  //     }
  //   );
  //   return data;
  // };

  public getAnnotatedFiles = async (): Promise<Array<IdEither>> => {
    const res = await this.get('/v1/files');
    const { files: fileIds } = res as any;
    return fileIds as Array<IdEither>;
  };
}

export default new ContextServiceApi();
