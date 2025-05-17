import * as React from 'react';
// import App from "./app";
import App from './LazyApp';
import { observer } from 'mobx-react';

let hot;
if (process.env.HMR === 'hot') {
  hot = require('react-hot-loader').hot;
}

const importApp = (): Promise<any> => {
  return Promise.all([
    // import(/* webpackChunkName: "svg-icons" */ "@main/boot"),
    // N.B: 通过 <App hide={true} /> 来prefetch AppStartUp chunk包
    App,
  ]);
};

@observer
class Main extends React.Component<{ store }> {
  state = {
    appComponent: undefined,
    isLogin: true,
  };
  public promiseResolveApp;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    importApp().then((res) => {
      new Promise((resolve) => {
        this.promiseResolveApp = () => {
          resolve(res[0]);
        };
      }).then((appComponent) => {
        this.setState({
          appComponent,
        });
      });
    });
  }

  render() {
    let content;
    // const { appRenderCount } = this.props.store;
    if (this.state.isLogin) {
      content = (
        // <React.Suspense fallback={this.renderLoading()}>
        <App
          // key={appRenderCount}
          {...this.props}
        />
        // </React.Suspense>
      );
    }

    const { appComponent: AppComponent } = this.state;

    return (
      <React.Fragment>
        {!this.state.isLogin && AppComponent && (
          <React.Suspense fallback={null}>
            <AppComponent hide key={'hide'} {...this.props} />
          </React.Suspense>
        )}
        {this.state.isLogin ? content : null}
      </React.Fragment>
    );
  }

  private renderLoading = () => (
    <div
      style={{
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      {/* <Spinner intent="primary" size={40} /> */}
    </div>
  );
}

// console.log('process.env.HMR', process.env.HMR);
let MainComp = Main;
if (hot) {
  MainComp = hot(module)(Main);
}
export default MainComp;
