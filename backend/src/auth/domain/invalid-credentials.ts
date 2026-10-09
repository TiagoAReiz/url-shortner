export class InvalidCredentials extends Error {
  constructor(message = 'Credenciais inválidas') {
    super(message);
    this.name = 'InvalidCredentials';
  }
}
