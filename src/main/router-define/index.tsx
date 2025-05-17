import React, { lazy } from 'react';

/*
  react.lazy issue: don't use export default for dynamic lazy Componet

  React Router caught the following error during render Error:
    Element type is invalid.
    Received a promise that resolves to: [object Object].
    Lazy element type must resolve to a class or function

wrong:
export default class Demo extends React.Component {}

work:
  export class Demo extends React.Component {}
  export { Demo as default } from './Demo'
*/

const Home = lazy(() => import('@main/pages/home'));
const Demo = lazy(() => import('@main/pages/demo'));

export const baseRouter = [
  {
    title: 'demo',
    exact: true,
    multi: true,
    path: '/demo',
    /* N.B cannot pass arrow funtion into element, which cause error blow:
    react-dom-client.development.js:7103 Functions are not valid as a React child. This may happen if you return element instead of <element /> from render. Or maybe you meant to call this function rather than return it.
    <Route.Provider>{element}</Route.Provider>

    wrong:
    element: (props) => {
      return <Demo />;
    }
    work:
    element: <Demo />,
    */
    element: <Demo />,
  },
  {
    title: 'Home',
    exact: true,
    multi: true,
    path: '/',
    element: <Home />,
  },
];

// const reports = getReportRouters();
export const routers = [...baseRouter];
