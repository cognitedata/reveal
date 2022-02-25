import { ApplicationItem } from 'store/config/types';

export const clusterPlaceholder = '__CLUSTER__';

export const allApplications: ApplicationItem[] = [
  {
    key: 'infield',
    iconKey: 'App.InField',
    title: 'InField',
    url: '',
    urlTemplate: `https://infield${clusterPlaceholder}.cogniteapp.com`,
  },
  {
    key: 'bestday',
    iconKey: 'App.BestDay',
    title: 'Best Day',
    url: '',
    urlTemplate: `http://bestday${clusterPlaceholder}.cogniteapp.com`,
  },
  {
    key: 'discover',
    iconKey: 'App.Discover',
    title: 'Discover',
    url: '',
    urlTemplate: `http://discover${clusterPlaceholder}.cogniteapp.com`,
  },
  {
    key: 'maintain',
    iconKey: 'App.Maintain',
    title: 'Maintain',
    url: `https://mp.cogniteapp.com`,
  },
  {
    key: 'charts',
    iconKey: 'App.Charts',
    title: 'Charts',
    url: '',
    urlTemplate: `https://charts${clusterPlaceholder}.cogniteapp.com`,
  },
  {
    key: 'blueprint',
    iconKey: 'App.Blueprint',
    title: 'Blueprint',
    url: '',
    urlTemplate: `https://blueprint${clusterPlaceholder}.cogniteapp.com`,
  },
];
