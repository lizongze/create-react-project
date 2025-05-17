import React, { Suspense } from 'react';
import { Provider as MobxProvider } from 'mobx-react';
import AppRouter from './AppRouter';

const globalMobxStore = {};

export class App extends React.PureComponent<{ store; hide?: boolean }> {
  render() {
    const { store: curStore, hide } = this.props;
    const store = curStore || globalMobxStore;
    // N.B: hide for prefetch AppStartUp chunk after LoginInterceptor mounted
    return (
      <MobxProvider store={store}>
        <Suspense>
          <AppRouter store={store} />
        </Suspense>
      </MobxProvider>
    );
  }
}

export default App;
