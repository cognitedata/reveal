import { type IconName } from '../../../src/architecture/base/utilities/types';

export function findIconByNameInContainer(icon: IconName, container: HTMLElement): Element | null {
  return container.querySelector(`svg[aria-label=${icon}Icon]`);
}
