import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';
import Spinner from './Spinner';

export default function GroupsRequired(props: { children: JSX.Element }) {
  const loaded = useSelector((state: RootState) => state.app.loaded);
  if (loaded) {
    return props.children;
  }
  return <Spinner />;
}
