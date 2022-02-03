import { storage } from '@extend-chrome/storage';

import { SecurityCheckupTimestamp } from './types';
import {
  securityCheckupFieldName,
  securityCheckupTimeInterval
} from './securityCheckupSettings';

export async function setSecurityCheckupTimestamp() {
  return storage.local.set({ [securityCheckupFieldName]: Date.now() });
}

export async function getSecurityCheckupTimestamp(): Promise<SecurityCheckupTimestamp | null> {
  const { [securityCheckupFieldName]: lastCheckupDate } =
    await storage.local.get(securityCheckupFieldName);

  if (!lastCheckupDate) {
    return null;
  }

  return +lastCheckupDate;
}

export function removeSecurityCheckupTimestamp() {
  storage.local.remove(securityCheckupFieldName);
}

export function initSecurityCheckupTimestamp() {
  return setSecurityCheckupTimestamp();
}

export async function checkDateToSecurityCheckup(): Promise<boolean> {
  const lastCheckupDate = await getSecurityCheckupTimestamp();

  if (!lastCheckupDate) {
    await initSecurityCheckupTimestamp();
    // Doesn't show security checkup prompt for initial time.
    // Because, obviously extension is running by new user and account was created recently
    // and user has 'downloaded Secret' Key recently
    return false;
  }

  return Date.now() - lastCheckupDate >= securityCheckupTimeInterval;
}
