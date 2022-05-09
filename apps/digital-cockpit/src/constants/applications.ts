import { ApplicationItem } from 'store/config/types';
import sidecar from 'utils/sidecar';
import discover from 'images/applications/discover.png';
import maintain from 'images/applications/maintain.png';
import charts from 'images/applications/charts.png';
import blueprint from 'images/applications/blueprint.png';
import bestday from 'images/applications/bestday.png';
import infield from 'images/applications/infield.png';

export const clusterPlaceholder = '__CLUSTER__';
export const clusterNoDotPlaceholder = '__CLUSTER_NO_DOT__';
export const tenantPlaceholder = '__TENANT__';

export const allApplications: ApplicationItem[] = [
  {
    key: 'charts',
    iconKey: 'App.Charts',
    title: 'Charts',
    featured: true,
    description:
      'Create charts with Time Series data inside of CDF. Manipulate data using our Node Editor.',
    categories: [
      'Cognite Application',
      'Production Optimisation',
      'No Code',
      'Featured',
    ],
    imageUrl: charts,
    url: '',
    installable: () => {
      return null;
    },
    installedCheckFunc: async () => true,
    urlTemplate: `https://charts.cogniteapp.com/${tenantPlaceholder}?env=${clusterNoDotPlaceholder}`,
    viewLink: 'https://hub.cognite.com/groups/charts-early-adopter-164',
  },
  {
    key: 'blueprint',
    iconKey: 'App.Blueprint',
    title: 'Blueprint',
    featured: true,
    imageUrl: blueprint,
    categories: [
      'Cognite Application',
      'Maintenance & Planning',
      'Production Optimisation',
      'No Code',
      'Featured',
    ],
    description:
      'Create interactive infographics in seconds. View live data on top of P&IDs, or any image you upload.',

    url: '',
    installable: () => {
      window.open(
        `https://blueprint${
          sidecar.cdfCluster ? `.${sidecar.cdfCluster}` : ''
        }.cogniteapp.com/${tenantPlaceholder}`,
        '_blank'
      );
    },
    installedCheckFunc: async (sdk) => {
      try {
        const dataset = await sdk.datasets
          .retrieve([{ externalId: 'BLUEPRINT_APP_DATASET' }])
          .then((res) => res[0]);
        if (dataset) {
          return true;
        }
        return false;
      } catch (_) {
        return false;
      }
    },
    urlTemplate: `https://blueprint${clusterPlaceholder}.cogniteapp.com/${tenantPlaceholder}`,
  },
  {
    key: 'infield',
    iconKey: 'App.InField',
    title: 'InField',
    imageUrl: infield,
    categories: ['Cognite Application', 'Maintenance & Planning'],
    description:
      'Cognite InFields collects, cleans, and contextualizes all kinds of industrial data to make it accessible and meaningful. ',
    url: '',
    urlTemplate: `https://infield${clusterPlaceholder}.cogniteapp.com/${tenantPlaceholder}`,
    viewLink: 'https://www.cognite.com/en/product/applications/cognite_infield',
  },
  {
    key: 'bestday',
    iconKey: 'App.BestDay',
    title: 'Best Day',
    imageUrl: bestday,
    categories: ['Cognite Application', 'Production Optimisation'],
    description:
      'Cognite BestDay is a central hub for decision support, providing a more continous, datadriven approach to optimization in your day-to-day operations. ',
    url: '',
    urlTemplate: `http://bestday${clusterPlaceholder}.cogniteapp.com/${tenantPlaceholder}`,
    viewLink: 'https://www.cognite.com/en/product/applications/cognite_bestday',
  },
  {
    key: 'discover',
    iconKey: 'App.Discover',
    title: 'Discover',
    imageUrl: discover,
    categories: ['Cognite Application', 'Production Optimisation'],
    description:
      'Discover is the CDF SaaS that provides instant access to your document, seismic and well data, as well as other subsurface data types.',
    url: '',
    urlTemplate: `http://discover${clusterPlaceholder}.cogniteapp.com/${tenantPlaceholder}`,
  },
  {
    key: 'maintain',
    iconKey: 'App.Maintain',
    title: 'Maintain',
    imageUrl: maintain,
    categories: ['Cognite Application', 'Maintenance & Planning'],
    description:
      'Cognite Maintain lets you construct, optimize, and analyze maintenance plans flexibly, intuitively, and automatically. ',
    url: `https://mp.cogniteapp.com/${tenantPlaceholder}`,
    viewLink:
      'https://www.cognite.com/en/product/applications/cognite_maintain',
  },
];
