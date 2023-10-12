import { CdfApplicationUsage } from './CdfApplicationUsage';
import { CdfHistoryUser } from './CdfHistoryUser';
import { CdfResourceUsage } from './CdfResourceUsage';
import { CdfUserHistoryStorage } from './CdfUserHistoryStorage';
import { getUserHistoryLocalStorageKey } from './getUserHistoryLocalStorageKey';

export class LocalStorageHistoryProvider implements CdfUserHistoryStorage {
  constructor(user: CdfHistoryUser) {
    this.localStorageKey = getUserHistoryLocalStorageKey(user);
  }

  private localStorageKey: string;

  private writeToLocalStorage(data: CdfUserHistoryStorage) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(data));
  }

  private readFromLocalStorage(): CdfUserHistoryStorage {
    const lsValue = localStorage.getItem(this.localStorageKey);
    return lsValue
      ? JSON.parse(lsValue)
      : { editedResources: [], viewedResources: [], usedApplications: [] };
  }

  get editedResources() {
    return this.readFromLocalStorage().editedResources;
  }

  set editedResources(arr: CdfResourceUsage[]) {
    const stored = this.readFromLocalStorage();
    this.writeToLocalStorage({ ...stored, editedResources: arr });
  }

  get viewedResources() {
    return this.readFromLocalStorage().viewedResources;
  }

  set viewedResources(arr: CdfResourceUsage[]) {
    const stored = this.readFromLocalStorage();
    this.writeToLocalStorage({ ...stored, viewedResources: arr });
  }

  get usedApplications() {
    return this.readFromLocalStorage().usedApplications;
  }

  set usedApplications(arr: CdfApplicationUsage[]) {
    const stored = this.readFromLocalStorage();
    // sort by count before saving it to localStorage
    const usedApplications = arr.sort((a, b) => b.count - a.count);
    this.writeToLocalStorage({ ...stored, usedApplications });
  }
}
