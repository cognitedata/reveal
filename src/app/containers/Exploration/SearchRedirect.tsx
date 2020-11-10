import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';

export default function SearchRedirect() {
  const { pathname } = useLocation();
  return <Redirect to={`${pathname}/search/asset`} push={false} />;
}
