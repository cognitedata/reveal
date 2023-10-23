import { CdfApplicationUsage } from './CdfApplicationUsage';
import { CdfHistoryUser } from './CdfHistoryUser';
import { CdfResourceUsage } from './CdfResourceUsage';
import { CdfUserHistoryStorage } from './CdfUserHistoryStorage';
import { LocalStorageHistoryProvider } from './LocalStorageHistoryProvider';

const SAVED_RESOURCE_LIMIT = 10;

const MINIMUM_USAGE_COUNT_FOR_RECENT_APPS = 5;

export class CdfUserHistoryService {
  constructor(user: CdfHistoryUser) {
    this.data = new LocalStorageHistoryProvider(user);
  }

  private data: CdfUserHistoryStorage;

  logNewApplicationUsage(appPath: string) {
    const timestamp = new Date().getTime().toString();
    const count =
      this.data.usedApplications.find((ele) => ele.name === appPath)?.count ||
      0;
    const application: CdfApplicationUsage = {
      name: appPath,
      count: count + 1,
      timestamp,
    };
    this.data.usedApplications = [
      application,
      ...this.data.usedApplications.filter((ele) => ele.name !== appPath),
    ];
  }

  logNewResourceEdit(resource: Omit<CdfResourceUsage, 'timestamp'>) {
    if (!resource.application || !resource.name || !resource.path) {
      return;
    }

    const timestamp = new Date().getTime().toString();
    const resourceList = this.data.editedResources.filter(
      (ele) => ele.path !== resource.path
    );
    this.data.editedResources = [
      {
        timestamp,
        ...resource,
      },
      ...resourceList,
    ].slice(0, SAVED_RESOURCE_LIMIT);
  }

  logNewResourceView(resource: Omit<CdfResourceUsage, 'timestamp'>) {
    if (!resource.application || !resource.name || !resource.path) {
      return;
    }

    const timestamp = new Date().getTime().toString();
    const resourceList = this.data.viewedResources.filter(
      (ele) => ele.path !== resource.path
    );
    this.data.viewedResources = [
      {
        timestamp,
        ...resource,
      },
      ...resourceList,
    ].slice(0, SAVED_RESOURCE_LIMIT);
  }

  // read user history resources from localStorage
  getCdfUserHistoryResources() {
    return this.data;
  }

  isResourcesEmpty() {
    return (
      !this.data.editedResources.length && !this.data.viewedResources.length
    );
  }

  isEditedResourcesEmpty() {
    return !this.data.editedResources.length;
  }

  isViewedResourcesEmpty() {
    return !this.data.viewedResources.length;
  }

  // check if user has used or navigated to at least 3 applications 5 or more times
  // to show them as recently used applications
  hasEnoughRecentlyUsedApplications() {
    return (
      this.data.usedApplications.filter(
        (item) => item.count >= MINIMUM_USAGE_COUNT_FOR_RECENT_APPS
      ).length >= 3
    );
  }

  // check if user has used or navigated to at least 3 applications
  // to show them as recently used applications
  // this is an extra utility function to test the UI, will eventually remove it or hasEnoughRecentlyUsedApplications
  hasRecentlyUsedApplications() {
    return this.data.usedApplications.length >= 3;
  }

  getRecentlyUsedApplications() {
    // return the top 3 most used applications
    return this.data.usedApplications.slice(0, 3);
  }
}
