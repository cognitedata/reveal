import { CogniteClient, ExternalFileInfo } from '@cognite/sdk';
import {
  AccessRight,
  AccessRightType,
  AccessType,
  BlueprintDefinition,
  BlueprintReference,
  User,
} from 'typings';
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

  getAccessRights = (
    blueprintReference: BlueprintReference | BlueprintDefinition
  ): AccessRightType => {
    if (blueprintReference.createdBy.uid === this.user.uid) {
      return 'WRITE';
    }
    const accessRight = blueprintReference.accessRights?.find(
      (right) => right.email === this.user.uid
    );
    if (accessRight) {
      return accessRight.access;
    }
    if (blueprintReference.accessType === 'PUBLIC') {
      return 'READ';
    }
    return 'NONE';
  };

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

      accessRights: item.metadata?.accessRights
        ? JSON.parse(item.metadata?.accessRights)
        : [],
      accessType: item.metadata?.accessType as AccessType,
    }));

    const allowedBlueprints = references.filter(
      (bpReference) =>
        this.getAccessRights(bpReference) !== 'NONE' ||
        bpReference.accessType === 'PUBLIC'
    );
    return allowedBlueprints;
  }

  async listOne(externalId: string): Promise<BlueprintReference> {
    const item = await this.client.files
      .retrieve([{ externalId }])
      .then((res) => res[0]);
    const reference: BlueprintReference = {
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

      accessRights: item.metadata?.accessRights
        ? JSON.parse(item.metadata?.accessRights)
        : [],
      accessType: item.metadata?.accessType as AccessType,
    };
    return reference;
  }

  async load(blueprintId: string): Promise<{
    definition: BlueprintDefinition;
    reference: BlueprintReference;
  }> {
    const reference = await this.listOne(blueprintId);
    if (!reference) {
      throw new Error('This blueprint does not exist');
    }
    if (this.getAccessRights(reference) === 'NONE') {
      throw new Error('You do not have access to view this blueprint');
    }
    const definition: BlueprintDefinition = await this.client.files
      .getDownloadUrls([{ externalId: blueprintId }])
      .then((res) =>
        this.client.get(res[0].downloadUrl).then((res) => res.data)
      );
    if (!this.isValidBlueprint(definition)) {
      throw new Error('Blueprint file is not valid.');
    }

    return { definition, reference };
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
        createdBy: JSON.stringify(blueprint.createdBy || this.user),
        type: 'blueprint_definition',
        name: blueprint?.name || 'Untitled Blueprint',
        accessRights: JSON.stringify(blueprint?.accessRights || []),
        accessType: blueprint?.accessType || 'PRIVATE',
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

  async updateAccess(
    externalId: string,
    accessRights?: AccessRight[],
    accessType?: AccessType
  ) {
    const { definition } = await this.load(externalId);
    return this.save({
      ...definition,
      accessRights,
      accessType,
    });
  }

  makeEmptyBlueprint = (externalId: string): BlueprintDefinition => ({
    externalId,
    name: 'Untitled Blueprint',
    createdBy: this.user,
    lastOpened: Date.now(),
    ornateShapes: [],
    nonPDFFiles: [],
    timeSeriesTags: [],
    accessRights: [],
    accessType: 'PRIVATE',
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
