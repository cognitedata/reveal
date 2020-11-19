import firebase from 'firebase/app';
import { Collection } from 'reducers/collections';

export class UserDataService {
  private readonly firebaseCollection: firebase.firestore.CollectionReference<
    firebase.firestore.DocumentData
  >;

  private readonly user: string;

  constructor(tenant: string, user: string) {
    this.user = user;
    this.firebaseCollection = firebase
      .firestore()
      .collection('tenants')
      .doc(tenant)
      .collection('charts');
  }

  async getCollections(): Promise<Collection[]> {
    const snapshot = await this.firebaseCollection
      .where('user', '==', this.user)
      .get();
    return snapshot.docs.map((doc) => doc.data()) as Collection[];
  }

  async saveCollection(collection: Collection): Promise<void> {
    return this.firebaseCollection.doc(collection.id).set(collection);
  }
}

export default UserDataService;
