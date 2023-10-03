import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ToastContainer } from '@cognite/cogs.js';

import { PermissionWrapper } from '../components/PermissionWrapper';
import { ClassifierContext } from '../machines/classifier/contexts/ClassifierContext';

import ClassifierPage from './Classifier/Classifier';
import Home from './Home';
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
