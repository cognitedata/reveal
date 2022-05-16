import { CogniteClient, ExternalFileInfo } from '@cognite/sdk';
import { BlueprintDefinition, BlueprintReference, User } from 'typings';
import { v4 as uuid } from 'uuid';

export const DATASET_EXTERNAL_ID = 'BLUEPRINT_APP_DATASET';

export type AccessRights = 'NONE' | 'READ' | 'WRITE';
export type ErrorCode = 'DS-404' | 'BP-403';
export type SetupValidation = {
  errorCode?: ErrorCode;
  dataSetId?: number;
  datasetAccess: AccessRights;
  filesAccess: AccessRights;
};
class BlueprintService {
  client: CogniteClient;
  user: User;
  constructor(client: CogniteClient, user: User) {
    this.client = client;
    this.user = user;
  }

  async validateSetup(): Promise<SetupValidation> {
    let errorCode;
    // Check that dataset exists
    const dataSetId = await this.client.datasets
      .retrieve([{ externalId: DATASET_EXTERNAL_ID }])
      .then((res) => res[0].id)
      .catch(() => {
        errorCode = 'DS-404';
        return undefined;
      });

    const capabilities = await this.client
      .get(`/api/v1/token/inspect`)
      .then((res) => res.data.capabilities as any);

    const datasetAccess = capabilities.some(
      (x: any) => x.datasetsAcl && x.datasetsAcl.actions.includes('WRITE')
    )
      ? 'WRITE'
      : 'NONE';

    const filesAccess = await this.client.files
      .list({
        filter: { dataSetIds: [{ id: dataSetId || 0 }] },
      })
      .then(() => 'READ' as AccessRights)
      .catch(() => {
        errorCode = 'BP-403';
        return 'NONE' as AccessRights;
      });

    return {
      dataSetId,
      errorCode,
      datasetAccess,
      filesAccess,
    };
  }

  isValidBlueprint(_: BlueprintDefinition): boolean {
    return true;
  }

  getAccessRights(
    blueprintReference: BlueprintReference | BlueprintDefinition
  ): AccessRights {
    if (blueprintReference.createdBy.uid === this.user.uid) {
      return 'WRITE';
    }
    return 'READ';
  }

  async list(): Promise<BlueprintReference[]> {
    const list = await this.client.files.list({
      filter: {
        metadata: {
          type: 'blueprint_definition',
        },
        dataSetIds: [{ externalId: DATASET_EXTERNAL_ID }],
      },
    });
    const references: BlueprintReference[] = list.items.map((item) => ({
      id: item.id,
      externalId: item.externalId || 'unknown',
      name: item.metadata?.name || 'Untitled Blueprint',
      lastOpened: Number(item.metadata?.lastOpened || Date.now()),
      createdBy: item.metadata?.createdBy
        ? JSON.parse(item.metadata?.createdBy)
        : {
            uid: '',
            email: 'unknown',
          },
    }));
    return references;
  }

  async load(blueprintId: string): Promise<BlueprintDefinition> {
    const definition = await this.client.files
      .getDownloadUrls([{ externalId: blueprintId }])
      .then((res) =>
        this.client.get(res[0].downloadUrl).then((res) => res.data)
      );
    if (!definition) {
      throw new Error('This blueprint does not exist');
    }
    if (!this.isValidBlueprint(definition)) {
      throw new Error('Blueprint file is not valid.');
    }
    if (this.getAccessRights(definition) === 'NONE') {
      throw new Error('You do not have access to view this blueprint');
    }

    return definition as BlueprintDefinition;
  }

  async delete(blueprintId: string): Promise<void> {
    // NEXT: User validation before deleting
    await this.client.files.delete([{ externalId: blueprintId }]);
  }

  async save(rawBlueprint?: BlueprintDefinition): Promise<BlueprintReference> {
    const blueprint: BlueprintDefinition =
      rawBlueprint || this.makeEmptyBlueprint(uuid());
    const { dataSetId } = await this.validateSetup();
    if (!dataSetId) {
      throw new Error(
        'Could not create new blueprint - insufficient permissions [ERRCODE: DS-400]'
      );
    }

    const externalId = blueprint?.externalId || uuid();
    const fileInfo: ExternalFileInfo = {
      externalId,
      name: `BLUEPRINT_${externalId}`,
      mimeType: 'application/json',
      dataSetId,
      source: 'Blueprint Application',
      metadata: {
        lastOpened: String(Date.now()),
        createdBy: JSON.stringify(this.user),
        type: 'blueprint_definition',
        name: blueprint?.name || 'Untitled Blueprint',
      },
    };

    const newFile = await this.client.files.upload(
      fileInfo,
      JSON.stringify(blueprint || this.makeEmptyBlueprint(externalId)),
      true,
      true
    );

    return {
      id: newFile.id,
      externalId,
      name: 'Untitled Blueprint',
      lastOpened: Date.now(),
      createdBy: this.user,
    };
  }

  makeEmptyBlueprint = (externalId: string): BlueprintDefinition => ({
    externalId,
    name: 'Untitled Blueprint',
    createdBy: this.user,
    lastOpened: Date.now(),
    ornateShapes: [],
    nonPDFFiles: [],
    timeSeriesTags: [],
  });

  uploadDiskFile = async (
    arrayBuffer: ArrayBuffer,
    mimeType: string,
    blueprintExternalId: string
  ) => {
    const imageExternalId = uuid();
    const name = `BLUEPRINT_${blueprintExternalId}_IMAGE_${imageExternalId}`;
    const { dataSetId } = await this.validateSetup();
    const newFile = await this.client.files.upload(
      {
        externalId: imageExternalId,
        name,
        mimeType,
        source: 'Blueprint Application User Upload',
        dataSetId,
        metadata: {
          createdBy: JSON.stringify(this.user),
          type: 'blueprint_user_image',
          blueprintExternalId,
          name,
        },
      },
      arrayBuffer,
      true,
      true
    );
    return newFile;
  };

  deleteOrphanFiles = async (
    blueprint: BlueprintDefinition,
    dataSetId: number
  ) => {
    const filesForBlueprint = await this.client.files
      .list({
        filter: {
          metadata: {
            blueprintExternalId: blueprint.externalId,
          },
          dataSetIds: [{ id: dataSetId }],
        },
      })
      .then((res) => res.items);

    if (filesForBlueprint.length <= 0) return;

    const nonPdfFiles = blueprint.nonPDFFiles.map((f) => ({
      id: f.fileId,
      externalId: f.fileExternalId,
    }));
    const pdfFiles = blueprint.ornateShapes.map((d) => ({
      id: d.attrs.fileReference.fileId,
      externalId: d.attrs.fileReferences.fileExternalId,
    }));

    const filesInBlueprint = [...pdfFiles, ...nonPdfFiles];
    const orphanFiles = filesForBlueprint.filter(
      (cdfFile) =>
        !filesInBlueprint.some(
          // eslint-disable-next-line eqeqeq
          (f) => f.externalId == cdfFile.externalId || f.id == cdfFile.id
        )
    );

    await this.client.files.delete(orphanFiles.map((x) => ({ id: x.id })));
  };
}

export default BlueprintService;
