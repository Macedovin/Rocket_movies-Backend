const { Router } = require('express');

const Movie_notesController = require("../controllers/Movie_notesController");

const movie_notesRoutes = Router();

const movie_notesController = new Movie_notesController();

movie_notesRoutes.post('/:user_id', movie_notesController.create);

movie_notesRoutes.get('/:id', movie_notesController.show);

movie_notesRoutes.put('/:id', movie_notesController.update);

movie_notesRoutes.delete('/:id', movie_notesController.delete);

movie_notesRoutes.get('/', movie_notesController.index);

module.exports = movie_notesRoutes;