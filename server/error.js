/**
 * HeedServerError class for propagating startup-errors with
 * friendly™ messages.
 *
 * @extends Error
 *
 * @property {string} message - The error message.
 * @property {string} suggestion - A user-friendly and usually use-less
 *                                 suggestion for resolving the error.
 */
export class HeedServerError extends Error {

  constructor(msg, suggestion) {
    super(msg);
    this.suggestion = suggestion;
  }

}
