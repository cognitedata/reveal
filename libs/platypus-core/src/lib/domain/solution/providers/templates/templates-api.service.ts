import {
  CogniteClient,
  TemplateGroup,
  TemplateGroupVersion,
} from '@cognite/sdk';
import { PlatypusError } from '@platypus/platypus-core';
import {
  CreateSchemaDTO,
  CreateSolutionDTO,
  DeleteSolutionDTO,
  FetchSolutionDTO,
  ListVersionsDTO,
} from '../../dto';

export class TemplatesApiService {
  constructor(private cdfClient: CogniteClient) {}

  createTemplateGroup(dto: CreateSolutionDTO): Promise<TemplateGroup> {
    const payload = [
      {
        externalId: dto.name,
        description: dto.description || '',
        owners: dto.owner ? [dto.owner] : [],
      },
    ];
    return this.cdfClient.templates.groups
      .create(payload)
      .then((templateGroups) => {
        const [createdTemplateGroup] = templateGroups;
        return createdTemplateGroup;
      });
  }

  deleteTemplateGroup(dto: DeleteSolutionDTO): Promise<unknown> {
    return this.cdfClient.templates.groups.delete([{ externalId: dto.id }], {
      ignoreUnknownIds: false,
    });
  }

  listTemplateGroups(): Promise<TemplateGroup[]> {
    return this.cdfClient.templates.groups
      .list()
      .then((templateGroups) => templateGroups.items);
  }

  fetchSchemaVersion(dto: FetchSolutionDTO): Promise<TemplateGroupVersion> {
    return this.listSchemaVersions(dto).then((versions) => {
      if (!versions.length) {
        return Promise.reject(
          new PlatypusError(
            `Specified version ${dto.version} does not exist!`,
            'NOT_FOUND'
          )
        );
      }

      //since we have filter applied, we will always have only one version
      return versions[0];
    });
  }

  listSchemaVersions(dto: ListVersionsDTO): Promise<TemplateGroupVersion[]> {
    const filter = dto.version
      ? {
          filter: {
            minVersion: +dto.version,
            maxVersion: +dto.version,
          },
        }
      : {};
    return this.cdfClient.templates
      .group(dto.solutionId)
      .versions.list(filter)
      .then((response) => response.items)
      .catch((err) => {
        return Promise.reject(
          new PlatypusError(err.message, 'NOT_FOUND', err.status, err.stack)
        );
      });
  }
  createSchema(dto: CreateSchemaDTO): Promise<TemplateGroupVersion> {
    return this.createOrUpdate(dto, 'Update');
  }
  updateSchema(dto: CreateSchemaDTO): Promise<TemplateGroupVersion> {
    return this.createOrUpdate(dto, 'Patch');
  }

  private createOrUpdate(
    dto: CreateSchemaDTO,
    mode: string
  ): Promise<TemplateGroupVersion> {
    return this.cdfClient.templates
      .group(dto.solutionId)
      .versions.upsert({
        schema: dto.schema,
        conflictMode: mode as any,
      })
      .catch((error) => {
        const errorType =
          error.errorMessage && error.errorMessage.includes('breaking changes')
            ? 'BREAKING_CHANGE'
            : 'ERROR_CREATING';
        return Promise.reject(
          new PlatypusError(error.message, errorType, error.status, error.stack)
        );
      });
  }
}
