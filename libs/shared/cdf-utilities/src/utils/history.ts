export type CdfResourceUsage = {
  path: string;
  name: string;
  application: string;
  timestamp: string;
};

export type CdfApplicationUsage = {
  name: string;
  count: number;
  timestamp: string;
};

export type CdfHistoryUser = {
  id: string;
  cluster: string;
  project: string;
};

interface CdfUserHistoryStorage {
  editedResources: CdfResourceUsage[];
  viewedResources: CdfResourceUsage[];
  usedApplications: CdfApplicationUsage[];
}

class LocalStorageHistoryProvider implements CdfUserHistoryStorage {
  constructor(user: CdfHistoryUser) {
    this.localStorageKey = `@cognite/fusion/browsing-history-${user.id}-${user.cluster}-${user.project}`;
    const lsValue = localStorage.getItem(this.localStorageKey);
    this.dataCache = lsValue
      ? JSON.parse(lsValue)
      : { editedResources: [], viewedResources: [], usedApplications: [] };
  }

  private localStorageKey: string;
  private dataCache: CdfUserHistoryStorage;

  private writeToLocalStorage() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.dataCache));
  }

  get editedResources() {
    return this.dataCache.editedResources;
  }

  set editedResources(arr: CdfResourceUsage[]) {
    this.dataCache.editedResources = arr;
    this.writeToLocalStorage();
  }

  get viewedResources() {
    return this.dataCache.viewedResources;
  }

  set viewedResources(arr: CdfResourceUsage[]) {
    this.dataCache.viewedResources = arr;
    this.writeToLocalStorage();
  }

  get usedApplications() {
    return this.dataCache.usedApplications;
  }

  set usedApplications(arr: CdfApplicationUsage[]) {
    // sort by count before saving it to localStorage
    this.dataCache.usedApplications = arr.sort((a, b) => b.count - a.count);
    this.writeToLocalStorage();
  }
}

export const MINIMUM_USAGE_COUNT_FOR_RECENT_APPS = 5;

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
    ].slice(0, 9);
  }

  logNewResourceView(resource: Omit<CdfResourceUsage, 'timestamp'>) {
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
    ].slice(0, 9);
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
