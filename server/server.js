const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const authRouter = require('./routes/auth');
const app = express();
app.use(cors({
  origin: '*',
}));

app.use('/', authRouter);
// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
// app.get('/author/:type', routes.author);
// app.get('/random', routes.random);
// app.get('/song/:song_id', routes.song);
// app.get('/album/:album_id', routes.album);
// app.get('/albums', routes.albums);
// app.get('/album_songs/:album_id', routes.album_songs);
// app.get('/top_songs', routes.top_songs);
// app.get('/top_albums', routes.top_albums);
// app.get('/search_songs', routes.search_songs);
//app.get('/user/:user_id', routes.user);

// routes for queries on the app

app.get('/top_books', routes.top_books);

app.get('/books/:book_id', routes.book);

// Complex
app.get('/search_books', routes.search_books);

app.get('/users/:user_id', routes.user);

// Complex
app.get('/search_authors', route.author);

// Complex will also get all of authors books and list them could even put total number of author reviews
app.get('/author/:author_id', routes.authors);

app.get('/authors', route.authors);

app.get('/author/:author_id/average', routes.author_average);

app.get('/review_leaderboard', route.review_leaderboard);

// Complex
app.get('/books/:book_id/reviews', routes.book_reviews);









// app.get('/books', routes.books);
// From passport.js website
// var router = express.Router();

// router.get('/login', function(req, res, next) {
//   res.render('login');
// // });

// module.exports = router;






app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
