const { Router } = require('express');

const UsersController = require("../controllers/UsersController");

const UsersAvatarController = require("../controllers/UsersAvatarController");

const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const usersRoutes = Router();

const usersController = new UsersController();

const usersAvatarController = new UsersAvatarController();

const multer = require('multer'); 

const uploadConfig = require('../configs/upload');

const upload = multer(uploadConfig.MULTER);

usersRoutes.post('/', usersController.create);

usersRoutes.patch("/avatar", ensureAuthenticated, upload.single('avatar'), usersAvatarController.update); 

usersRoutes.put('/', ensureAuthenticated, usersController.update);

usersRoutes.delete('/', ensureAuthenticated, usersController.delete);

module.exports = usersRoutes;