const { hash, compare } = require('bcryptjs');

const AppError = require("../utils/AppError");

const knex = require('../database/knex');

class UsersController {
  async create(request, response) { 
    const { name, email, password } = request.body;
    
    const checkUserExists = await knex("users").where({ email }).first();

    if (checkUserExists) {
      throw new AppError("Este email já esta em uso.");
    }

    const hashedPassword = await hash(password, 8);
 
    await knex("users").insert({
      name,
      email,
      password: hashedPassword
    })

    response.status(201).json({
			status: 201,
			message: "O usuário foi cadastrado."
    });
  }

  async update(request, response) {
    const { new_name, new_email, new_password, current_password } = request.body;

    const { id } = request.params;
    
    const userInfos = await knex("users").where({ id }).first();
    
    let updated_data = { ...userInfos };

    if (!userInfos) {
  
      throw new AppError("Usuário não encontrado.");
    }

    if (new_name) {
      updated_data.name = new_name;
    } 

    if (new_email) {

      const emailAlreadyExists = await knex("users").where({ email: new_email }).first();  
      
      if (emailAlreadyExists && emailAlreadyExists.id !== userInfos.id) {
        throw new AppError(" Este email já está em uso. Tente outro.")
      }    
  
      if (emailAlreadyExists) {
        throw new AppError(" Este email já está em uso. Tente outro.")
      }
        
      updated_data.email = new_email;
    }

    if(new_password && !current_password) {
      throw new AppError("Você precisa informar a senha antiga para definir a nova senha.");
    }

    if(new_password && current_password) {
  
      const checkOldPassword = await compare(current_password, userInfos.password);

      if(!checkOldPassword) {
        throw new AppError("A senha antiga não confere.");
      }
      
      const newHashedPassword = await hash(new_password, 8);

      updated_data.password = newHashedPassword;

    }
    
    await knex("users")
      .where({ id })
      .update({ 
      name: updated_data.name,
      email: updated_data.email,
      password: updated_data.password,
      updated_at: knex.fn.now()
    });
  
    return response.status(201).json({
      status: 201,
      message: "Os dados foram atualizados com sucesso."
    }); 

  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("users").where({ id }).delete();

    return response.json({
      status: 200,
      message: "O usuário foi excluído com sucesso."
    });
  }
}

module.exports = UsersController;