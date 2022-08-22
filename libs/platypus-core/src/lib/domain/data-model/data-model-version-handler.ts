import { DTO, PlatypusError, Result } from '@platypus-core/boundaries/types';
import {
  Validator,
  ValidatorResult,
} from '@platypus-core/boundaries/validation';
import { RequiredFieldValidator } from '../common/validators/required-field.validator';
import { IGraphQlUtilsService } from './boundaries';
import {
  ConflictMode,
  CreateDataModelVersionDTO,
  DataModelApiOutputDTO,
  FetchDataModelVersionDTO,
  GraphQLQueryResponse,
  ListDataModelVersionsDTO,
  RunQueryDTO,
} from './dto';
import {
  MixerApiService,
  MixerBindingsBuilder,
  DmsApiService,
  DmsModelBuilder,
} from './services';
import { DataModelVersionDataMapper } from './services/data-mappers/data-model-version-data-mapper';
import { DataModelValidationErrorDataMapper } from './services/data-mappers/data-model-validation-error-data-mapper';

import {
  DataModelValidationError,
  DataModelVersion,
  DataModelVersionStatus,
} from './types';
import { mixerApiBuiltInTypes } from './constants';

export class DataModelVersionHandler {
  private dataModelVersionDataMapper: DataModelVersionDataMapper;
  private dmsBuilderService: DmsModelBuilder;
  private mixerBindingsBuilderService: MixerBindingsBuilder;
  private validationErrorDataMapper: DataModelValidationErrorDataMapper;

  constructor(
    private mixerApiService: MixerApiService,
    private dmsApiService: DmsApiService,
    private graphqlService: IGraphQlUtilsService
  ) {
    // Internal services, no need to export to the outside world
    this.dataModelVersionDataMapper = new DataModelVersionDataMapper();
    this.dmsBuilderService = new DmsModelBuilder();
    this.mixerBindingsBuilderService = new MixerBindingsBuilder();
    this.validationErrorDataMapper = new DataModelValidationErrorDataMapper();
  }

  /**
   * Fetch data model (template group) schema
   * @param dto
   */
  version(dto: FetchDataModelVersionDTO): Promise<Result<DataModelVersion>> {
    const validationResult = this.validateField(dto, ['dataModelId']);

    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    return this.versions(dto)
      .then((versions) => {
        const dataModelVersions = versions.getValue();

        return dataModelVersions.find(
          (apiSpecVersion) =>
            apiSpecVersion.version.toString() === dto.version.toString()
        ) as DataModelVersion;
      })
      .then((dataModel: DataModelVersion) =>
        Result.ok(dataModel as DataModelVersion)
      )
      .catch((err: PlatypusError) => Result.fail(err));
  }

  /**
   * List Data Model Versions
   * @param dto
   */
  versions(dto: ListDataModelVersionsDTO): Promise<Result<DataModelVersion[]>> {
    const validationResult = this.validateField(dto, ['dataModelId']);
    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    return this.mixerApiService
      .getApisByIds(dto.dataModelId, true)
      .then((results: DataModelApiOutputDTO[]) => {
        if (!results || !results.length || results.length > 1) {
          return Promise.reject(
            new PlatypusError(
              `Specified version ${dto.dataModelId} does not exist!`,
              'NOT_FOUND'
            )
          );
        }

        if (!results || !results[0] || !results[0].versions) {
          return [];
        }
        // eslint-disable-next-line
        const versions = results[0].versions!;
        return versions.map((version) =>
          this.dataModelVersionDataMapper.deserialize(dto.dataModelId, version)
        );
      })
      .then((versions) => Result.ok(versions))
      .catch((err: PlatypusError) => Result.fail(err));
  }

  async validate(
    dto: CreateDataModelVersionDTO,
    validateBreakingChanges = true
  ): Promise<Result<DataModelValidationError[]>> {
    const errors = this.graphqlService.validate(
      dto.schema,
      mixerApiBuiltInTypes
    );

    if (errors.length) {
      return Promise.resolve(Result.fail(errors));
    }

    if (!validateBreakingChanges || !dto.externalId) {
      return Promise.resolve(Result.ok(errors));
    }

    // if all ok til this point, the schema should be valid
    // we can check for breaking changes
    const typeDefs = this.graphqlService.parseSchema(dto.schema);

    try {
      const validationErrors = await this.mixerApiService.validateDataModel(
        {
          apiExternalId: dto.externalId,
          graphQl: dto.schema,
        },
        'PATCH'
      );

      const dataModelErrors = validationErrors!.map((err: any) =>
        this.validationErrorDataMapper.deserialize(err as any, typeDefs)
      );

      return dataModelErrors.length
        ? Result.fail(dataModelErrors)
        : Result.ok([]);
    } catch (err) {
      return Result.fail(err);
    }
  }

  /**
   * Publish new schema by bumping the version.
   * @param dataModelVersion - DataModelVersion
   * @param conflictMode - NEW_VERSION | PATCH
   */
  async publish(
    dto: CreateDataModelVersionDTO,
    conflictMode: ConflictMode
  ): Promise<Result<DataModelVersion>> {
    const validationResult = this.validateField(dto, ['externalId']);
    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    // Create DataModelVersion out of request obj
    const dataModelVersionDto = {
      createdTime: dto.createdTime || Date.now(),
      lastUpdatedTime: dto.lastUpdatedTime || Date.now(),
      externalId: dto.externalId,
      schema: dto.schema,
      status: dto.status || DataModelVersionStatus.PUBLISHED,
      version: dto.version,
    } as DataModelVersion;

    // Validate Data Model
    const dataModelValidation = await this.validate(
      dataModelVersionDto,
      conflictMode === 'PATCH'
    );
    if (!dataModelValidation.isSuccess) {
      const errors = dataModelValidation.errorValue();
      const errorResponse = PlatypusError.fromDataModelValidationError(errors);

      return Result.fail(errorResponse);
    }

    let version;

    const dataModelVersion = dto.version ? +dto.version : 1;

    const dataModelVersionCreateDto = {
      apiExternalId: dto.externalId,
      graphQl: dto.schema,
      bindings: dto.bindings,
      version: dataModelVersion,
    };

    try {
      // if bindings are provided, that would mean that the user is
      // controlling the storage and bindings manually using CLI
      if (dto.bindings) {
        // Patch the API and set new bindings
        version = await this.mixerApiService.publishVersion(
          dataModelVersionCreateDto,
          'PATCH'
        );
        const dataModelVersion = this.dataModelVersionDataMapper.deserialize(
          dto.externalId,
          version
        );

        return Result.ok(dataModelVersion);
      } else {
        // if no bindings are provided then try to autogenerate them
        const typeDefs = this.graphqlService.parseSchema(dto.schema);
        const bindings = this.mixerBindingsBuilderService.build(
          dto.externalId,
          dataModelVersionDto,
          typeDefs
        );

        const models = this.dmsBuilderService.build(
          dto.externalId,
          dataModelVersionDto,
          typeDefs
        );

        // Hack for now!
        // We need to validate everything first before creating DMS
        // However if we send the bindings in the first call to Mixer API
        // Validation will fail and it will complain that DMS Model Does not exist
        // Solution is first to do MixerAPi validation with empty bindings
        let version = await this.mixerApiService.publishVersion(
          {
            ...dataModelVersionCreateDto,
            bindings: [],
          },
          conflictMode
        );

        // Create DMS models
        await this.dmsApiService.upsertModel(models);

        // Patch the API and set new bindings
        version = await this.mixerApiService.publishVersion(
          {
            ...dataModelVersionCreateDto,
            bindings,
          },
          'PATCH'
        );
        const dataModelVersion = this.dataModelVersionDataMapper.deserialize(
          dto.externalId,
          version
        );
        return Result.ok(dataModelVersion);
      }
    } catch (error) {
      return Result.fail(error);
    }
  }

  /**
   * Run GraphQL query against a Data Model Version
   * @param dto
   */
  runQuery(dto: RunQueryDTO): Promise<Result<GraphQLQueryResponse>> {
    const validationResult = this.validateField(dto, ['dataModelId']);

    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }
    const reqDto = {
      ...dto,
      extras: { ...dto.extras, apiName: dto.dataModelId },
    } as RunQueryDTO;

    return this.mixerApiService
      .runQuery(reqDto) // return type GraphQlResponse
      .then((response) => Result.ok(response))
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  private validateField(dto: DTO, fields: string[]): ValidatorResult {
    const validator = new Validator(dto);
    fields.forEach((field) =>
      validator.addRule(field, new RequiredFieldValidator())
    );
    return validator.validate();
  }
}
