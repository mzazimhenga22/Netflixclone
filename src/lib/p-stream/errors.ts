export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class FetchError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'FetchError';
  }
}
