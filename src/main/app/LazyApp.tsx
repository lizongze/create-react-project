import { lazy } from 'react';

export default lazy(
  () =>
    import(
      /* webpackChunkName: "AppStartup" */
      './App'
    ),
);
