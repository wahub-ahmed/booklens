const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const authRouter = require('./routes/auth');
const app = express();
app.use(cors({
  origin: '*',
}));

// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: false,
//   //store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
// }));

// app.use(passport.authenticate('session'));
app.use('/', authRouter);
// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js

// routes for queries on the app

app.get('/top_books', routes.top_books);

app.get('/top_authors', routes.top_authors);

app.get('/books/:book_title', routes.book);

// Complex
app.get('/search_books', routes.search_books);

app.get('/users/:user_id', routes.user);

// Complex
app.get('/search_authors', routes.search_authors);

// Complex will also get all of authors books and list them could even put total number of author reviews
app.get('/authors/:author_id', routes.author);

app.get('/authors', routes.authors);

app.get('/authors/:author_id/average', routes.author_average);

app.get('/review_leaderboard', routes.review_leaderboard);

// Complex will have to join tables
app.get('/books/:book_title/reviews', routes.book_reviews);






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
