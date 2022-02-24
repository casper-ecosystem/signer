import { BackgroundManager } from '../BackgroundManager';
import { AppState } from '../../lib/MemStore';
import { computed } from 'mobx';
import {
  isNumberish,
  isURefString,
  motesToCSPR,
  numberWithSpaces,
  SigningDataRow,
  truncateString
} from '../../shared';

class SigningContainer {
  constructor(
    private backgroundManager: BackgroundManager,
    private appState: AppState
  ) {}

  @computed
  get deployToSign() {
    if (this.appState.unsignedDeploys.length > 0) {
      return this.appState.unsignedDeploys[0];
    }
    return null;
  }

  @computed
  get messageToSign() {
    if (this.appState.unsignedMessages.length > 0) {
      return this.appState.unsignedMessages[0];
    }
    return null;
  }

  async parseDeployData(deployId: number) {
    return await this.backgroundManager.parseDeployData(deployId);
  }

  async signDeploy(deployId: number) {
    await this.backgroundManager.signDeploy(deployId);
  }

  async cancel(deployId: number) {
    await this.backgroundManager.rejectSignDeploy(deployId);
  }

  async approveSigningMessage(messageId: number) {
    await this.backgroundManager.approveSigningMessage(messageId);
  }

  async cancelSigningMessage(messageId: number) {
    await this.backgroundManager.cancelSigningMessage(messageId);
  }
}

export const truncationLengthCutoff = 13;
export const isLongValue = (value: string) =>
  value.length > truncationLengthCutoff;
export const isCSPRValueByKey = (key: string) =>
  ['Amount', 'Payment', 'Transaction Fee'].includes(key);
export const shouldNotTruncate = (key: string) =>
  ['Timestamp', 'Chain Name'].includes(key);

export const parseRow = (row: SigningDataRow): SigningDataRow => {
  // Special case for items that should not be truncated for readability e.g. Timestamp
  if (shouldNotTruncate(row.key)) {
    return row;
  }
  // The value is a list e.g. a CLList or CLTuple
  if (Array.isArray(row.value)) {
    return row;
  }

  // The value is a stringified number e.g. an amount in motes
  if (isNumberish(row.value)) {
    // If the number represents Motes then display the CSPR value in the tooltip
    if (isCSPRValueByKey(row.key)) {
      row.tooltipContent = `${motesToCSPR(row.value)} CSPR`;
    }
    // If the number was truncated show it fully in the tooltip
    if (isLongValue(row.value)) {
      row.tooltipContent = row.value;
    }

    // If the number is particularly long then truncate it
    row.value = isLongValue(row.value)
      ? truncateString(row.value, 6, 6)
      : numberWithSpaces(row.value);

    return row;
  }

  // The value is formatted string URef
  if (isURefString(row.value)) {
    // The main value will be truncated so display the full string in the tooltip
    row.tooltipContent = row.value;
    // Due to the standard prefix and suffix we use longer chunks to show more of the unique data
    row.value = truncateString(row.value, 9, 9);

    return row;
  }

  // The value is a long string e.g. a key or hash
  if (isLongValue(row.value)) {
    // The main value will be truncated so display the full string in the tooltip
    row.tooltipContent = row.value;
    row.value = truncateString(row.value, 6, 6);

    return row;
  }

  return row;
};

export default SigningContainer;
