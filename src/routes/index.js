const { Router } = require('express');

const sessionsRoutes = require('./sessions.routes')

const usersRoutes = require('./users.routes');

const movie_notesRoutes = require("./movie_notes.routes");

const tagsRoutes = require("./tags.routes");

const routes = Router();

routes.use("/sessions", sessionsRoutes)

routes.use("/users", usersRoutes);

routes.use("/movie_notes", movie_notesRoutes);

routes.use("/tags", tagsRoutes);

module.exports = routes;