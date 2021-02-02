import firebase from 'firebase/app';
import { Workflow } from 'reducers/workflows';

export class WorkflowService {
  private readonly firebaseCollection: firebase.firestore.CollectionReference<
    firebase.firestore.DocumentData
  >;

  constructor(tenant: string) {
    this.firebaseCollection = firebase
      .firestore()
      .collection('tenants')
      .doc(tenant)
      .collection('workflows');
  }

  async getWorkflowById(workflowId: string): Promise<Workflow> {
    const snapshot = await this.firebaseCollection.doc(workflowId).get();
    const result = snapshot.data();
    return result as Workflow;
  }

  /**
   * Creates a workflow, or saves that workflow if the ID exists already
   * @param newWorkflow New or existing workflow
   */
  async saveWorkflow(workflow: Workflow): Promise<void> {
    return this.firebaseCollection
      .doc(workflow.id)
      .set(JSON.parse(JSON.stringify(workflow)));
  }

  async deleteWorkflow(workflow: Workflow): Promise<any> {
    return this.firebaseCollection.doc(workflow.id).delete();
  }
}

export default WorkflowService;
