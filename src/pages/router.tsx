import { ToastContainer } from '@cognite/cogs.js';
import { PermissionWrapper } from 'components/PermissionWrapper';
import { ClassifierContext } from 'machines/classifier/contexts/ClassifierContext';
import ClassifierPage from 'pages/Classifier/Classifier';
import Home from 'pages/Home';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LabelsPage } from './Labels/Labels';
import LabelPage from './Label/Label';

export const MainRouter = () => {
  return (
    <>
      <ToastContainer />

      <BrowserRouter>
        <PermissionWrapper>
          <Routes>
            <Route
              path="/:project/documents/classifier/:classifierName"
              element={
                <ClassifierContext>
                  <ClassifierPage />
                </ClassifierContext>
              }
            />
            <Route
              path="/:project/documents/labels/:externalId"
              element={<LabelPage />}
            />
            <Route path="/:project/documents/labels" element={<LabelsPage />} />
            <Route path="/:project/documents" element={<Home />} />
          </Routes>
        </PermissionWrapper>
      </BrowserRouter>
    </>
  );
};
