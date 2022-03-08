import { decodeBase16 } from 'casper-js-sdk';

export const isNumberish = (stringNumber: string) => {
  return !isNaN(+stringNumber);
};

export const isURefString = (value: string) => {
  if (typeof value !== 'string') return false;

  const [prefix, uref, suffix] = value.split('-');

  if (!prefix || !uref || !suffix) return false;

  const urefBytes = decodeBase16(uref);
  return prefix === 'uref' && urefBytes.length === 32 && suffix.length === 3;
};

export const truncateString = (
  longString: string,
  startChunk: number,
  endChunk: number
): string => {
  if (!longString) throw new Error('Error parsing long string.');
  return (
    longString.substring(0, startChunk) +
    '...' +
    longString.substring(longString.length - endChunk)
  );
};

export const numberWithSpaces = (numberString: string) => {
  if (!isNumberish(numberString)) {
    throw new Error('Unable to parse string as number');
  }
  // Adds a space in after 3 digits
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const motesToCSPR = (motes: string) => {
  if (!isNumberish(motes)) {
    throw new Error('Unable to parse motes string as number');
  }
  return (+motes / 1000000000).toString();
};
