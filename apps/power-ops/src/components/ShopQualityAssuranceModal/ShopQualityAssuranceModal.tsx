import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom-v5';
import { Modal, Infobox } from '@cognite/cogs.js-v9';
import { useMetrics } from '@cognite/metrics';
import { CommonTable } from 'components/CommonTable';
import { useFetchBidProcessResult } from 'queries/useFetchBidProcessResult';
import { ShopRunPenalties } from 'types';

import { shopPenaltiesExceedLimit, shopRunPenaltiesColumns } from './utils';
import { StyledInfobar } from './elements';

type Props = {
  bidProcessEventExternalId: string;
};

export const ShopQualityAssuranceModal = ({
  bidProcessEventExternalId,
}: Props) => {
  const metrics = useMetrics('bid-matrix');

  const { priceAreaExternalId } = useParams<{
    priceAreaExternalId: string;
  }>();

  const [showShopRunPenaltiesModal, setShowShopRunPenaltiesModal] =
    useState(false);

  const { data: bidProcessResult } = useFetchBidProcessResult(
    priceAreaExternalId,
    bidProcessEventExternalId
  );

  const shopRunPenaltiesData: ShopRunPenalties[] = useMemo(() => {
    if (!bidProcessResult) return [];
    return bidProcessResult.priceScenarios
      .map((scenario) =>
        scenario.objectives.map((objective) => ({
          sequenceId: objective.sequenceId,
          sequenceExternalId: objective.sequenceExternalId,
          sumPenalties: objective.sumPenalties,
          majorPenalties: objective.majorPenalties,
          minorPenalties: objective.minorPenalties,
          solverStatus: objective.solverStatus,
          limitPenalties: objective.limitPenalties,
          scenario: scenario.name,
          watercourse: objective.watercourse,
        }))
      )
      .flat();
  }, [bidProcessResult]);

  const penaltiesLimitExceeded = useMemo(() => {
    if (!bidProcessResult) return false;
    return shopPenaltiesExceedLimit(bidProcessResult);
  }, [bidProcessResult]);

  const handleViewReportClick = () => {
    metrics.track('click-view-shop-run-penalties-button', {
      priceAreaExternalId,
    });
    setShowShopRunPenaltiesModal(true);
  };

  return penaltiesLimitExceeded ? (
    <>
      <StyledInfobar
        type="danger-bold"
        buttonText="View Report"
        onButtonClick={handleViewReportClick}
      >
        Shop run penalties are above the recommended limit
      </StyledInfobar>

      <Modal
        data-testid="shop-run-penalties-modal"
        visible={showShopRunPenaltiesModal}
        title="Shop run penalties"
        onCancel={() => setShowShopRunPenaltiesModal(false)}
        getContainer={() =>
          document.getElementById('root') ?? document.documentElement
        }
        size="large"
        hideFooter
      >
        <Infobox type="danger" title="Penalties are above set limit">
          Based on the output of shop run penalties, we advise you to re-run
          shop or make adjustments to the models before sending or using this
          bid.
        </Infobox>
        <CommonTable
          data={shopRunPenaltiesData}
          columns={shopRunPenaltiesColumns}
          showPagination={false}
          pageSize={shopRunPenaltiesData.length}
        />
      </Modal>
    </>
  ) : null;
};
