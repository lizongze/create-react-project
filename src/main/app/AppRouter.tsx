import * as React from 'react';
import { createHashRouter, RouterProvider, createBrowserRouter } from 'react-router-dom';
// import history from './router-history';
import { routers as normalRoutes } from '@main/router-define';

export class AppRouter extends React.PureComponent<{ hide?: boolean }> {
  render() {
    // const routerElement = createBrowserRouter(normalRoutes);
    const routerElement = createHashRouter(normalRoutes);

    // N.B: hide for prefetch AppStartUp chunk after LoginInterceptor mounted
    return <RouterProvider router={routerElement} />;
  }
}

export default AppRouter;
