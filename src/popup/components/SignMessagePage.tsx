import { observer } from 'mobx-react';
import React from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router';
import { ListInline } from './Utils';
import { Button } from 'react-bootstrap';
import SignMessageContainer from '../container/SignMessageContainer';
import Pages from './Pages';
import { browser } from 'webextension-polyfill-ts';

interface Props extends RouteComponentProps {
  signMessageContainer: SignMessageContainer;
}

@observer
class SignMessagePage extends React.Component<Props, {}> {
  async componentDidMount() {
    let w = await browser.windows.getCurrent();
    if (w.type === 'popup') {
      window.addEventListener('beforeunload', e => {
        this.props.signMessageContainer.cancel();
      });
    }
  }

  render() {
    if (this.props.signMessageContainer.toSignMessage) {
      return (
        <div>
          <div className="mt-5 mb-4 text-center">
            <h5>Your signature is being requested</h5>
          </div>

          <div className="mt-5 mb-3">
            <p>Deploy hash (base16):</p>
            <p>{this.props.signMessageContainer.toSignMessage!.data}</p>
          </div>
          <div className="text-center mt-5">
            <ListInline>
              <Button
                onClick={() => {
                  this.props.signMessageContainer.cancel();
                }}
                variant="secondary"
                className={'mr-3'}
                block={true}
              >
                Cancel
              </Button>
              <Button
                onClick={() => this.props.signMessageContainer.signMessage()}
                className={'ml-3'}
                block={true}
              >
                Sign
              </Button>
            </ListInline>
          </div>
        </div>
      );
    } else {
      return <Redirect to={Pages.Home} />;
    }
  }
}

export default withRouter(SignMessagePage);
