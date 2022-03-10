import { ToastContainer } from '@cognite/cogs.js';
import { PermissionWrapper } from 'src/components/PermissionWrapper';
import { ClassifierContext } from 'src/machines/classifier/contexts/ClassifierContext';
import ClassifierPage from 'src/pages/Classifier/Classifier';
import Home from 'src/pages/Home';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LabelPage from './Label/Label';

export const MainRouter = () => {
  return (
    <>
      <ToastContainer />

      <BrowserRouter>
        <PermissionWrapper>
          <Routes>
            <Route
              path="/:project/documents/classifier/labels/:externalId"
              element={<LabelPage />}
            />
            <Route
              path="/:project/documents/classifier"
              element={
                <ClassifierContext>
                  <ClassifierPage />
                </ClassifierContext>
              }
            />
            <Route path="/:project/documents" element={<Home />} />
          </Routes>
        </PermissionWrapper>
      </BrowserRouter>
    </>
  );
};
