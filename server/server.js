const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const app = express();
app.use(cors({
  origin: '*',
}));

// routes for queries on the app

app.get('/top_books', routes.top_books);

app.get('/top_authors', routes.top_authors);

app.get('/books/:book_id', routes.book);

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
app.get('/books/:book_id/reviews', routes.book_reviews);


app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
