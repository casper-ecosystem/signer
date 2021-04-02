import AuthController from './AuthController';
import { AppState } from '../lib/MemStore';
import * as nacl from 'tweetnacl-ts';
import { encodeBase64 } from 'tweetnacl-ts';
import store from 'store';

jest.mock('store', () => {
  const memoryStore = new Map();

  return {
    get: (key: string, optionalDefaultValue?: any): any => {
      return memoryStore.get(key) || optionalDefaultValue;
    },
    set: (key: string, value: any): any => {
      memoryStore.set(key, value);
    },
    remove: (key: string): void => {
      memoryStore.delete(key);
    }
  };
});

// jsdom haven't implement crypto, which is highly used by browser-passworder, so we mock this library here.
jest.mock('browser-passworder', () => {
  return {
    encrypt: (password: string, data: any): any => {
      let toEncodeObj = {
        data: data,
        password: password
      };
      return JSON.stringify(toEncodeObj);
    },
    decrypt: (password: string, dataStr: string): any => {
      let obj = JSON.parse(dataStr);
      if (obj.password !== password) {
        throw new Error();
      }
      return obj.data;
    }
  };
});

describe('AuthController', () => {
  let appState: AppState;
  let authController: AuthController;
  const password = 'correct_password';
  const wrongPassword = 'wrong_password';
  beforeEach(async () => {
    appState = new AppState();
    authController = new AuthController(appState);
    store.remove('encryptedVault');
    await expect(
      authController.createNewVault(password)
    ).resolves.toBeUndefined();
  });

  test('it should be able to create a new vault only once with password', async () => {
    await expect(authController.createNewVault(password)).rejects.toThrow();
  });

  test('it should be able to lock and unlock using correct password', async () => {
    expect(authController.isUnlocked).toBeTruthy();
    await authController.lock();
    expect(authController.isUnlocked).toBeFalsy();
    await expect(authController.unlock(wrongPassword)).rejects.toThrow();
    await authController.unlock(password);
    expect(authController.isUnlocked).toBeTruthy();

    // make sure we have fixed https://github.com/CasperLabs/CasperLabs/pull/1821#discussion_r409650020
    await authController.importUserAccount(
      'account1',
      encodeBase64(nacl.sign_keyPair().secretKey)
    );

    await authController.lock();
    await authController.unlock(password);
    expect(authController.isUnlocked).toBeTruthy();
  });

  it('should be able to add new account and failed when either name or private key duplicated', async () => {
    let signKeyPair1 = nacl.sign_keyPair();
    let duplicateAccountName = 'account1';
    await expect(
      authController.importUserAccount(
        duplicateAccountName,
        encodeBase64(signKeyPair1.secretKey)
      )
    ).resolves.toBeUndefined;
    let signKeyPair2 = nacl.sign_keyPair();
    await expect(
      authController.importUserAccount(
        duplicateAccountName,
        encodeBase64(signKeyPair2.secretKey)
      )
    ).rejects.toThrow(/same name/g);
    await expect(
      authController.importUserAccount(
        'new name',
        encodeBase64(signKeyPair1.secretKey)
      )
    ).rejects.toThrow(/same private key/g);
  });

  it('should be able to switch account by account name', async () => {
    const switchAccount1 = 'switch_account1';
    const switchAccount2 = 'switch_account2';
    await authController.importUserAccount(
      switchAccount1,
      encodeBase64(nacl.sign_keyPair().secretKey)
    );
    await authController.importUserAccount(
      switchAccount2,
      encodeBase64(nacl.sign_keyPair().secretKey)
    );

    expect(appState.selectedUserAccount?.name).toBe(switchAccount2);

    authController.switchToAccount(switchAccount1);
    expect(appState.selectedUserAccount?.name).toBe(switchAccount1);

    expect(() => {
      authController.switchToAccount('not_exist');
    }).toThrow(/doesn't exist/g);
  });

  it('should be able to save and restore userAccounts and selectUserAccount information', async () => {
    await authController.importUserAccount(
      'account1',
      encodeBase64(nacl.sign_keyPair().secretKey)
    );
    await authController.importUserAccount(
      'account2',
      encodeBase64(nacl.sign_keyPair().secretKey)
    );

    // restore from storage
    const anotherState = new AppState();
    const anotherAuthContainer = new AuthController(anotherState);
    await anotherAuthContainer.unlock(password);

    // jest.toEqual is deep equal
    expect(anotherState.userAccounts).toEqual(appState.userAccounts);
    expect(anotherState.selectedUserAccount).toEqual(
      appState.selectedUserAccount
    );
  });
});
