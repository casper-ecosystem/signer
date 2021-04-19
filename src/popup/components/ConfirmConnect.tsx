import React from 'react';
import { confirm } from './Confirmation';

export default function confirmConnect() {
  return confirm(
    <div className="text-danger">Approve Connection</div>,
    <div>
      Connecting allows this site to:
      <br />
      <ul>
        <li>View your selected public key.</li>
        <li>Make signing requests.</li>
      </ul>
      are you sure you want to connect?
    </div>,
    'Connect',
    'Cancel'
  );
}
