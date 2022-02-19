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
