import { createHashRouter, RouterProvider, createBrowserRouter } from 'react-router-dom';
// import history from './router-history';
import { routers as normalRoutes } from '@main/router-define';

export const AppRouter = (props: { hide?: boolean; store?: {} }) => {
  // const routerElement = createBrowserRouter(normalRoutes);
  const routerElement = createHashRouter(normalRoutes);
  return <RouterProvider router={routerElement} />;
};
