import { storage } from '@extend-chrome/storage';

import { SecurityCheckupTimestamp } from './types';
import {
  securityCheckupStorageKey,
  securityCheckupTimeInterval
} from './securityCheckupSettings';

export async function resetSecurityCheckupTimestamp() {
  return storage.local.set({ [securityCheckupStorageKey]: Date.now() });
}

export async function getSecurityCheckupTimestamp(): Promise<SecurityCheckupTimestamp | null> {
  const { [securityCheckupStorageKey]: lastCheckupDate } =
    await storage.local.get(securityCheckupStorageKey);

  if (!lastCheckupDate) {
    return null;
  }

  return +lastCheckupDate;
}

export function removeSecurityCheckupTimestamp() {
  storage.local.remove(securityCheckupStorageKey);
}

export function initSecurityCheckupTimestamp() {
  return resetSecurityCheckupTimestamp();
}

export async function isTimeToSecurityCheckup(): Promise<boolean> {
  const lastCheckupDate = await getSecurityCheckupTimestamp();

  if (!lastCheckupDate) {
    await initSecurityCheckupTimestamp();
    return true;
  }

  return Date.now() - lastCheckupDate >= securityCheckupTimeInterval;
}
