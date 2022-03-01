import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { modalClose } from 'store/modals/actions';
import { Title } from '@cognite/cogs.js';
import Modal from 'components/modals/simpleModal/Modal';
import { ModalContainer } from 'components/modals/elements';
import useCogniteApplications from 'hooks/useCogniteApplications';
import { useMetrics } from 'utils/metrics';

import ApplicationCard from './ApplicationCard';

const SelectApplications: React.FC = () => {
  const metrics = useMetrics('SelectApplicationsModal');
  const dispatch = useDispatch<RootDispatcher>();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const { allApplications, allCategories } = useCogniteApplications();

  const handleClose = () => {
    metrics.track('CloseModal');
    dispatch(modalClose());
  };

  const renderCategory = (category: string) => {
    const applicationsForCategory = allApplications.filter((app) =>
      app.categories?.includes(category)
    );
    return (
      <div>
        <Title level={5} style={{ marginBottom: 16, marginTop: 32 }}>
          {category}
        </Title>
        <div className="app-grid">
          {applicationsForCategory
            .sort((app) => (app.featured ? -1 : 1))
            .map((app) => (
              <ApplicationCard app={app} key={app.key} />
            ))}
        </div>
      </div>
    );
  };

  return (
    <Modal
      visible
      onCancel={handleClose}
      headerText="Browse Applications"
      hasFooter={false}
      width={window.innerWidth * 0.9}
      height={window.innerHeight * 0.9}
    >
      <ModalContainer>
        <aside>
          <button
            type="button"
            onClick={() => {
              metrics.track('SelectCategory', { category: 'all' });
              setSelectedCategory('');
            }}
          >
            All
          </button>
          <hr />
          {allCategories.map((category) => (
            <button
              type="button"
              className={selectedCategory === category ? 'active' : ''}
              key={category}
              onClick={() => {
                metrics.track('SelectCategory', { category });
                setSelectedCategory(category);
              }}
            >
              {category}
            </button>
          ))}
        </aside>
        <main>
          {allCategories
            .filter((category) =>
              selectedCategory ? category === selectedCategory : true
            )
            .map(renderCategory)}
        </main>
      </ModalContainer>
    </Modal>
  );
};

export default SelectApplications;
