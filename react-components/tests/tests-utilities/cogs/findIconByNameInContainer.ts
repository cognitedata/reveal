import { IconName } from '../../../src/architecture/base/utilities/IconName';

export function findIconByNameInContainer(icon: IconName, container: HTMLElement): Element | null {
  return container.querySelector(`svg[aria-label=${icon}Icon]`);
}
