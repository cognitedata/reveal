export interface AppData {
  entrypoint: string;
  files: {
    [key: string]: {
      content?:
        | {
            $case: 'text';
            text: string;
          }
        | {
            $case: 'data';
            data: Uint8Array;
          };
    };
  };
  requirements: string[];
}

export interface StreamLitAppSpec {
  name: string;
  description: string;
  fileExternalId: string;
  creator: string;
  code: AppData;
  dataSetId?: number;
  createdAt: Date;
  published?: boolean;
}

export type SteamLitAppSpecNoContent = Omit<StreamLitAppSpec, 'code'>;
