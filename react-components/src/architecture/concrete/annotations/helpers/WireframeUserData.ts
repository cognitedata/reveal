import { type Annotation } from './Annotation';
import { type Status } from './Status';

export class WireframeUserData {
  public selected: boolean;
  public status: Status;
  public annotations: Annotation[] = []; // Pending annotation has empty array

  public constructor(status: Status, selected: boolean) {
    this.status = status;
    this.selected = selected;
  }

  public get length(): number {
    return this.annotations.length;
  }

  public get isEmpty(): boolean {
    return this.length === 0;
  }

  public includes(annotation: Annotation): boolean {
    return this.annotations.includes(annotation);
  }

  public add(annotation: Annotation): void {
    this.annotations.push(annotation);
  }
}
