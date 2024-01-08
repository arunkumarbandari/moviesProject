const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getMoviesArray = `
        SELECT
        movie_name
        FROM
        movie
        ORDER BY
        movie_id;
    `;
  const moviesArray = await db.all(getMoviesArray);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
        INSERT INTO
            movie(director_id, movie_name, lead_actor)
        VALUES
            (
                '${directorId}',
                ${movieName},
                ${leadActor}
            );
    `;
  const dbResponse = await db.run(addMovieQuery);
  const resp = "Movie Successfully Added";
  response.send(resp);
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT
        *
        FROM
        movie
        WHERE
        movie_id = ${movieId};
  `;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
        UPDATE
        movie
        SET
        director_id = '${directorId}',
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
        WHERE
        movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  respone.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM
        movie
        WHERE
        movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT
        *
        FROM
        director
        ORDER BY
        director_id;
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    moviesArray.map((eachDirector) => ({
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    }))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const directorId = request.params;
  const getDirectorMoviesQuery = `
        SELECT 
        movie_name
        FROM
        movie LEFT JOIN director
        ON
        movie.director_id = director.director_id
        WHERE
        movie.director_id = ${directorId};
    `;
  const movieArray = await db.run(getDirectorMoviesQuery);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
