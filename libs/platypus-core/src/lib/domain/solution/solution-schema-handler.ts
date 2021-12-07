import { DTO, Result } from '@platypus-core/boundaries/types';
import {
  Validator,
  ValidatorResult,
} from '@platypus-core/boundaries/validation';
import { RequiredFieldValidator } from '../common/validators/required-field.validator';
import { ISolutionSchemaApiService } from './boundaries';
import { CreateSchemaDTO, FetchSolutionDTO, ListVersionsDTO } from './dto';
import { SolutionSchema } from './types';

export class SolutionSchemaHandler {
  constructor(private solutionSchemaService: ISolutionSchemaApiService) {}

  /**
   * Fetch solution (template group) schema
   * @param dto
   */
  version(dto: FetchSolutionDTO): Promise<Result<SolutionSchema>> {
    const validationResult = this.validate(dto, ['solutionId']);

    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    return this.solutionSchemaService
      .fetchSchemaVersion(dto)
      .then((solution: SolutionSchema) =>
        Result.ok(solution as SolutionSchema)
      );
  }

  /**
   * List Solution schema (template groups) versions
   * @param dto
   */
  versions(dto: ListVersionsDTO): Promise<Result<SolutionSchema[]>> {
    const validationResult = this.validate(dto, ['solutionId']);
    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    return this.solutionSchemaService
      .listSchemaVersions(dto)
      .then((versions) => Result.ok(versions))
      .catch((err) => Result.fail(err));
  }

  /**
   * Publish new schema by bumping the version.
   * @param dto
   */
  publish(dto: CreateSchemaDTO): Promise<Result<SolutionSchema>> {
    const validationResult = this.validate(dto, ['solutionId']);

    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    return this.solutionSchemaService
      .publishSchema(dto)
      .then((version) => Result.ok(version))
      .catch((err) => Result.fail(err));
  }

  /**
   * Patch the existing version, but will fail if there are breaking changes.
   * @param dto
   */
  update(dto: CreateSchemaDTO): Promise<Result<SolutionSchema>> {
    return this.solutionSchemaService
      .updateSchema(dto)
      .then((version) => Result.ok(version))
      .catch((err) => Result.fail(err));
  }

  private validate(dto: DTO, fields: string[]): ValidatorResult {
    const validator = new Validator(dto);
    fields.forEach((field) =>
      validator.addRule(field, new RequiredFieldValidator())
    );
    return validator.validate();
  }
}
