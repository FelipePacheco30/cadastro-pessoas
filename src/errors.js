export class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

export class ValidationError extends AppError {
  constructor(detalhes) {
    super('Dados inválidos', 400);
    this.detalhes = detalhes;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Pessoa não encontrada') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Já existe uma pessoa cadastrada com este CPF') {
    super(message, 409);
  }
}
