import { observable } from 'mobx';

export class ErrorContainer {
  // We can display the last error when it happens.
  @observable lastError: string | null = null;

  // This version just sets the error message.
  capture(p: Promise<void>): Promise<void> {
    return p.catch(err => {
      this.lastError = err.message;
    });
  }

  // This version re-raises the error, which, if uncaught, shows up in the console.
  withCapture<T>(p: Promise<T>): Promise<T> {
    return p.catch(err => {
      this.lastError = err.message;
      throw err;
    });
  }

  dismissLast() {
    this.lastError = null;
  }
}

export default ErrorContainer;
