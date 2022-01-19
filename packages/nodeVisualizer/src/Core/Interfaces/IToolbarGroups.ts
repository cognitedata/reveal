import { BaseCommand } from "@/Core/Commands/BaseCommand";

export interface IToolbarGroups {
  [groupId: string]: BaseCommand[];
}
