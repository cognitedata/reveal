import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function SearchRedirect() {
  const { pathname, search } = useLocation();
  return (
    <Navigate to={{ pathname: `${pathname}/search/asset`, search }} replace />
  );
}
