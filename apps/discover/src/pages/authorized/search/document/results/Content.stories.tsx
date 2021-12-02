// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - PLEASE FIX NEXT TIME YOU CHANGE THIS FILE

import React from 'react';
import { Provider } from 'react-redux';

import { store } from '_helpers/store';

import Content from './Content';

const withProvider = (story) => <Provider store={store}>{story()}</Provider>;

export default {
  title: 'Pages / Document Search',
  component: Content,
  decorators: [withProvider],
};

export const Result = () => {
  // const [result, setResult] = useState([]);

  return <Content hasSearched hasResults />;
};

export const empty = () => (
  <Content hasSearched hasResults={false} phrase="location:tatooine" />
);

export const frontPage = () => <Content hasSearched={false} />;
