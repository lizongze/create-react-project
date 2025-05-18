import { Suspense } from 'react';
import { Provider as MobxProvider } from 'mobx-react';
import { AppRouter } from './AppRouter';

const globalMobxStore = {};

export const App = (props: { store; hide?: boolean }) => {
  const { store: curStore, hide } = props;
  const store = curStore || globalMobxStore;
  // N.B: hide for prefetch AppStartUp chunk after LoginInterceptor mounted
  return (
    <MobxProvider store={store}>
      <Suspense>
        <AppRouter store={store} />
      </Suspense>
    </MobxProvider>
  );
};

export default App;
