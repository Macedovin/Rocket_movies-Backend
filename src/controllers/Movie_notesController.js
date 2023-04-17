const knex = require('../database/knex');

const AppError = require("../utils/AppError");

class Movie_notesController {
  async create(request, response) {   
    const { title, description, tags, score } = request.body;
  
    const user_id = request.user.id;
    
    const outsideScoreValueRange = score <= 0 || score > 5;

    const isScoreInteger = Number.isInteger(score);

    if (outsideScoreValueRange || !isScoreInteger) {
      throw new AppError("A nota deve ser um número inteiro de 1 a 5")
    }
    
    if(tags.length === 0) {
      throw new AppError("Você deve adicionar pelo menos um marcador referente a este filme!")
    }

    const [movie_noteId] = await knex("movie_notes").insert({
      title,
      description,
      score,
      user_id
    });

    const tagsLinked = tags.map(name => {
      return {
        movieNotes_id: movie_noteId,
        name,
        user_id
      }
    });

    await knex("tags").insert(tagsLinked);
  
    return response.status(201).json({
      status: 201,
      message: "A nota do filme foi inserida com sucesso"
    });
  }
  
  async show(request, response) {
    const { id } = request.params;

    const movie_note = await knex("movie_notes").where({ id }).first();

    if(!movie_note) {
      return response.status(204).json()
    };

    const tags = await knex("tags").where({ movieNotes_id: id }).orderBy("name");

    return response.json({
      ...movie_note,
      tags
    });
  }
 
  async update(request,response) {
    const { new_title, new_description, new_score, new_tags } = request.body

    const { id } = request.params;

    const movie_noteInfos = await knex("movie_notes").where({ id }).first();

    let updated_noteData = { ...movie_noteInfos };

    let updateIsBeingSucceeded;

    if (new_title) {
      updated_noteData.title = new_title;

      updateIsBeingSucceeded = true;
    }

    if (new_description) {
      updated_noteData.description = new_description;

      updateIsBeingSucceeded = true;
    }

    if (new_score) {
      const checkScoreValue = new_score <= 0 || new_score > 5 
      
      const isScoreInteger = Number.isInteger(new_score)

      if (checkScoreValue || !isScoreInteger) {
        throw new AppError("A nota deve ser um número inteiro de 1 a 5")
      }

      updated_noteData.score = new_score;

      updateIsBeingSucceeded = true;
    }

    if (new_tags) {
      
      const newTagsOfThisNote = new_tags.map(tag => {

        const tagsTrimmed = tag.trim();

        return {
          movieNotes_id: id,
          user_id: movie_noteInfos.user_id,
          name: tagsTrimmed
        }
      })
      
      const oldTagsOfThisNote = await knex("tags").where({ movieNotes_id: movie_noteInfos.id }).delete();

      await knex("tags").insert(newTagsOfThisNote); 
      
      updateIsBeingSucceeded = true;
    }

    if (updateIsBeingSucceeded) {
      
      await knex("movie_notes")
        .where({ id })
        .update({
          title: updated_noteData.title,
          description: updated_noteData.description,
          score: updated_noteData.score,
          updated_at: knex.fn.now()
        });
 
      return response.status(201).json({
        status: 201,
        message: "A nota foi atualizada com sucesso"
      });

    } else {

      return response.status(400).json({
        status: 400,
        message: "Ao menos um novo dado deve ser inserido para que seja efetuada a atualização."
      });

    }

  }
  
  async delete(request, response) {
    const {id } = request.params;

    await knex("movie_notes").where({ id }).delete();

    return response.json({
      status: 200,
      message: "A nota foi excluída com sucesso."
    });
  }

  async index(request, response) {
    const { title, tags } = request.query;

    const user_id = request.user.id;

    const titleTrimmed = title.trim();

    let notesOfMovies;

    if (tags) {

      const filteredTags = tags.split(',').map(tag => tag.trim())

      notesOfMovies = await knex("tags")
        .select([
          "movie_notes.id",
          "movie_notes.title",
          "movie_notes.description",
          "movie_notes.score"
        ])
        .where("movie_notes.user_id", user_id)
        .whereLike("movie_notes.title", `%${titleTrimmed}%`)
        .whereIn("name", filteredTags)
        .innerJoin("movie_notes", "movie_notes.id", "tags.movieNotes_id" )
        .orderBy("movie_notes.title")

    } else {

      notesOfMovies = await knex("movie_notes")
        .where({ user_id })
        .whereLike("title", `%${titleTrimmed}%`)
        .orderBy("title")
    }
    
    const userTags = await knex("tags").where({ user_id });
    
    const notesOfMovieWithTags = notesOfMovies.map(noteOfMovie => {
      const notesOfMoviesTags = userTags.filter(tag => tag.movieNotes_id === noteOfMovie.id);

      return {
        ...noteOfMovie,
        tags: notesOfMoviesTags
      }
    })

    return response.json(notesOfMovieWithTags);  
  }
}
module.exports = Movie_notesController;