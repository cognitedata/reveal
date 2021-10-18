import { Route, Redirect, Switch } from 'react-router-dom';

import navigation from 'constants/navigation';

import ThreeDee from './modules/3d';
import Casing from './modules/casing';
import DigitalRocks from './modules/digitalRocks';
import EventsNds from './modules/events/Nds';
import EventsNpt from './modules/events/Npt';
import Geomechanics from './modules/geomechanics';
import LogType from './modules/logType';
import Measurements from './modules/measurements';
import MultiplePPFG from './modules/multiplePPFG';
import Overview from './modules/overview';
import RelatedDocument from './modules/relatedDocument';
import Trajectory from './modules/trajectory';

export const InspectRouter = () => (
  <Switch>
    <Route path={navigation.SEARCH_WELLS_INSPECT_OVERVIEW} render={Overview} />
    <Route
      path={navigation.SEARCH_WELLS_INSPECT_TRAJECTORY}
      render={Trajectory}
    />
    <Route path={navigation.SEARCH_WELLS_INSPECT_LOGTYPE} render={LogType} />
    <Route
      path={navigation.SEARCH_WELLS_INSPECT_CASINGSCOMPLETIONS}
      render={Casing}
    />
    <Route
      path={navigation.SEARCH_WELLS_INSPECT_EVENTSNDS}
      render={EventsNds}
    />
    <Route
      path={navigation.SEARCH_WELLS_INSPECT_EVENTSNPT}
      render={EventsNpt}
    />
    <Route
      path={navigation.SEARCH_WELLS_INSPECT_RELATEDDOCUMENTS}
      render={RelatedDocument}
    />
    <Route
      path={navigation.SEARCH_WELLS_INSPECT_DIGITALROCKS}
      render={DigitalRocks}
    />
    <Route
      path={navigation.SEARCH_WELLS_INSPECT_MEASUREMENTS}
      render={Measurements}
    />
    <Route path={navigation.SEARCH_WELLS_INSPECT_THREEDEE} render={ThreeDee} />
    <Route
      path={navigation.SEARCH_WELLS_INSPECT_GEOMECHANIC}
      render={Geomechanics}
    />
    <Route
      path={navigation.SEARCH_WELLS_INSPECT_MULTIPLEPPFG}
      render={MultiplePPFG}
    />
    <Redirect
      from={navigation.SEARCH_WELLS_INSPECT}
      to={navigation.SEARCH_WELLS_INSPECT_OVERVIEW}
    />
  </Switch>
);

export default InspectRouter;
