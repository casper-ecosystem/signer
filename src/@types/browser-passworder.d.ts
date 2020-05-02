declare module 'browser-passworder' {
  export function encrypt(password: string, dataObj: Object): Promise<string>;

  /**
   * @throws new Error('Incorrect password') when password is not correct
   */
  export function decrypt(password: string, encrypted: string): Promise<Object>;
}
