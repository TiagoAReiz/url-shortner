export class NotFoundUrl extends Error {
  constructor(public readonly url: string) {
    super(`Url não encontrada ${url}`);
    this.name = "NotFoundUrl";
  }
}