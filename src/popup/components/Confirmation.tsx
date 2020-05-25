import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {
  confirmable,
  createConfirmation,
  ReactConfirmProps
} from 'react-confirm';

interface Props extends ReactConfirmProps {
  proceedLabel: string;
  cancelLabel: string;
  title: string | React.ReactElement;
}

class Confirmation extends React.Component<Props, {}> {
  render() {
    return (
      <div className="static-modal">
        <Modal show={this.props.show} onHide={this.props.dismiss}>
          <Modal.Header>
            <Modal.Title>{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.props.confirmation}</Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.props.cancel()}>
              {this.props.cancelLabel}
            </Button>
            <Button
              className="button-l"
              variant="primary"
              onClick={() => this.props.proceed()}
            >
              {this.props.proceedLabel}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export function confirm(
  title: string | React.ReactElement,
  confirmation: string | React.ReactElement,
  proceedLabel = 'OK',
  cancelLabel = 'cancel',
  options = {}
) {
  return createConfirmation(confirmable(Confirmation))({
    title,
    confirmation,
    proceedLabel,
    cancelLabel,
    ...options
  });
}
