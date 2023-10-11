/* eslint-disable @nx/enforce-module-boundaries */
import { Route, Routes, Navigate } from 'react-router-dom';

import ExplorerRoutes from '@flexible-data-explorer/app/Routes';
// import { IndustryCanvasPage } from '@fusion/industry-canvas';

import { Flex } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { UserProfilePage } from '../pages/UserProfilePage/UserProfilePage';

import { AppSelector } from './components/topbar/AppSelector';

export const CoreRoutes = () => {
  const { isEnabled } = useFlag('CDF_BUSINESS_isEnabled', {
    forceRerender: true,
    fallback: false,
  });
  if (!isEnabled) {
    return (
      <Flex
        justifyContent="center"
        alignItems="center"
        style={{
          height: 'calc(100vh - 56px)',
          background: 'var(--cogs-surface--action--muted--default)',
        }}
      >
        <AppSelector />
      </Flex>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/explore" replace />} />
      <Route path="/explore/*" element={<ExplorerRoutes />} />
      {/* <Route path="/canvas/*" element={<IndustryCanvasPage />} /> */}
      {/* <Route path="/charts/*" element={<div>On its way...</div>} /> */}
      <Route path="/profile/*" element={<UserProfilePage />} />
    </Routes>
  );
};
