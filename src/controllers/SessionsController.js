const knex = require('../database/knex');

const { compare } = require('bcryptjs');

const AppError = require('../utils/AppError');

const authConfig = require('../configs/auth');

const { sign } = require('jsonwebtoken');

class SessionsController {
  async create(request, response) {
    const { email, password } = request.body;

    const checkedUser = await knex("users").where({ email }).first();

    if (!checkedUser) {
      throw new AppError("E-mail e/ ou senha incorreta.", 401);
    }

    const passwordMatched = await compare(password, checkedUser.password, );

    if(!passwordMatched) {
      throw new AppError("E-mail e/ ou senha incorreta.", 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign(
      {},
      secret,
      {
        subject: String(checkedUser.id),
        expiresIn
      }
    )
    return response.json({ checkedUser, token });
  }
}

module.exports = SessionsController;