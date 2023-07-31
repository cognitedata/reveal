import { BaseCommand } from '../Commands/BaseCommand';

export interface IToolbarGroups {
  [groupId: string]: BaseCommand[];
}
