import ErrorBoundaryLayout from './components/ErrorBoundaryLayout';
import RouteNotFound from './components/RouteNotFound';

import { ThemeMode } from './components/ThemeMode';
import { Authentication } from './screens/authentication';
import { TableMasterUser } from './screens/master-user';
import { TableMasterToleranceGrouping } from './screens/master-tolerance-grouping';
import { ToleranceGroupings } from './screens/master-tolerance-grouping';
import { License } from './screens/license';
import { Homepage } from './screens/homepage';
import { Report } from './screens/reports';
import { SelectWorkorder } from './screens/select-workorder';
import { Settings } from './screens/settings';
import { TableMasterProduct } from './screens/master-product/TableMasterProduct';
import { TableMasterFormulation } from './screens/master-product/TableMasterFormulation';
import { Formulations } from './screens/master-formulation';

import './index.css';
import './assets/custom-styles/keyboard.css';
import 'react-simple-keyboard/build/css/index.css';

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import {
  MasterProductLayout,
  Products,
} from './screens/master-product';

function App() {
  const AppRoutes = createBrowserRouter([
    {
      element: <ErrorBoundaryLayout />,
      children: [
        {
          path: '/',
          element: <Homepage />,
        },
        {
          path: 'auth',
          element: <Authentication />,
        },
        {
          path: 'license',
          element: <License />,
        },
        {
          path: 'masters',
          element: <MasterProductLayout />,
          children: [
            {
              path: 'master-product-data',
              element: <TableMasterProduct />,
            },
            {
              path: 'master-formulation-data',
              element: <TableMasterFormulation />,
            },
            {
              path: 'master-user-data',
              element: <TableMasterUser />,
            },
            {
              path: 'master-tolerance-grouping-data',
              element: <TableMasterToleranceGrouping />,
            },
          ],
        },
        {
          path: 'tolerance-grouping',
          element: <ToleranceGroupings />,
        },
        {
          path: 'formulations',
          element: <Formulations />,
        },
        {
          path: 'products',
          element: <Products />,
        },
        {
          path: 'reports',
          element: <Report />,
        },
        {
          path: 'select-workorder',
          element: <SelectWorkorder />,
        },
        {
          path: 'settings',
          element: <Settings />,
        },
        {
          path: '*',
          element: <RouteNotFound />,
        },
      ],
    },
  ]);

  return <RouterProvider router={AppRoutes} />;
}

export default App;
