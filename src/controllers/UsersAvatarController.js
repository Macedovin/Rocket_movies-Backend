const knex = require('../database/knex');

const AppError = require('../utils/AppError');

const DiskStorage = require('../providers/DiskStorage');

class UsersAvatarController {
  async update(request, response) {

    const user_id = request.user.id;

    const avatarFileName =request.file.filename;

    const diskStorage = new DiskStorage();
    
    const avatarUser = await knex("users").where({ id: user_id}).first();

    if(!avatarUser) {
      throw new AppError("Somente usuários autenticados podem mudar o avatar.", 401)
    }

    if(avatarUser.avatar) {

      await diskStorage.deleteFile(avatarUser.avatar);

    }

    const filename = await diskStorage.saveFile(avatarFileName);

    avatarUser.avatar = filename;

    await knex("users").update(avatarUser).where({ id: user_id })

    return response.json(avatarUser);
  } 
}

module.exports = UsersAvatarController;