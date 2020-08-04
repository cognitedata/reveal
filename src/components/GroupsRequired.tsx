import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';
import { Loader } from 'components/Common';

export default function GroupsRequired(props: { children: JSX.Element }) {
  const loaded = useSelector((state: RootState) => state.app.loaded);
  if (loaded) {
    return props.children;
  }
  return <Loader />;
}
