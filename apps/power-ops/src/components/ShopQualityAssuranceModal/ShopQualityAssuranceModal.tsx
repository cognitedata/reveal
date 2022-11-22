import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Body, Infobox, Icon } from '@cognite/cogs.js';
import { useMetrics } from '@cognite/metrics';
import { CommonTable } from 'components/CommonTable';
import { useFetchBidProcessResult } from 'queries/useFetchBidProcessResult';
import { ShopRunPenalties } from 'types';

import { shopPenaltiesExceedLimit, shopRunPenaltiesColumns } from './utils';
import { StyledModal, StyledInfobar } from './elements';

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

      <StyledModal
        testId="shop-run-penalties-modal"
        visible={showShopRunPenaltiesModal}
        title={<Body strong>Shop run penalties</Body>}
        width={840}
        onCancel={() => setShowShopRunPenaltiesModal(false)}
        closeIcon={<Icon data-testid="close-modal-icon" type="CloseLarge" />}
        appElement={document.getElementById('root') ?? document.documentElement}
        getContainer={() =>
          document.getElementById('root') ?? document.documentElement
        }
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
      </StyledModal>
    </>
  ) : null;
};
