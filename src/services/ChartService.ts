import firebase from 'firebase/app';
import { Chart, ChartWorkflow } from 'reducers/charts/types';
import { User } from 'reducers/environment';

export class ChartService {
  private readonly firebaseCollection: firebase.firestore.CollectionReference<
    firebase.firestore.DocumentData
  >;

  constructor(tenant: string) {
    this.firebaseCollection = firebase
      .firestore()
      .collection('tenants')
      .doc(tenant)
      .collection('charts');
  }

  async getCharts(user: User): Promise<Chart[]> {
    const myCharts = await this.getMyCharts(user);
    const publicCharts = await this.getPublicCharts();
    // Merge myCharts and publicCharts, but without duplicates
    // Start with myCharts, since it is expected that this array
    // has less elements than publicCharts
    const allCharts = myCharts.reduce(
      (acc, myChart) => {
        const duplicate = publicCharts.find(
          (publicChart) => publicChart.id === myChart.id
        );
        if (!duplicate) {
          acc.push(myChart);
        }
        return acc;
      },
      [...publicCharts]
    );
    return allCharts;
  }

  async getMyCharts(user: User): Promise<Chart[]> {
    const snapshot = await this.firebaseCollection
      .where('user', '==', user.email)
      .get();
    return snapshot.docs.map((doc) => doc.data()) as Chart[];
  }

  async getPublicCharts(): Promise<Chart[]> {
    const snapshot = await this.firebaseCollection
      .where('public', '==', true)
      .get();
    return snapshot.docs.map((doc) => doc.data()) as Chart[];
  }

  async saveChart(chart: Chart): Promise<void> {
    return this.firebaseCollection.doc(chart.id).set(chart);
  }

  async deleteChart(chart: Chart): Promise<void> {
    this.firebaseCollection.doc(chart.id).delete();
  }

  async setWorkflowsOnChart(
    chartId: string,
    workflowCollection: ChartWorkflow[]
  ): Promise<boolean> {
    await this.firebaseCollection.doc(chartId).update({ workflowCollection });
    return true;
  }
}

export default ChartService;
