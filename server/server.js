const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const authRouter = require('./routes/auth');
const app = express();
app.use(cors({
  origin: '*',
}));

// app.use('/', authRouter);
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

// SELECT
//     b.Title,
//     b.Description,
//     b.image,
//     b.previewLink,
//     b.publisher,
//     b.publishedDate,
//     b.infoLink,
//     b.categories,
//     b.ratingsCount,
//     AVG(r.ReviewScore) AS AvgReviewScore
// FROM
//     books b
// JOIN
//     ratings r ON b.Title = r.BookTitle
// GROUP BY
//     b.Title, b.Description, b.image, b.previewLink, b.publisher,
//     b.publishedDate, b.infoLink, b.categories, b.ratingsCount
// ORDER BY
//     AvgReviewScore DESC
// LIMIT 10;

app.get('/books/:book_title', routes.book);

// SELECT *
// FROM books
// WHERE title='${booktitle}'

// Complex
app.get('/search_books', routes.search_books);

// const search_books = async function(req, res) {
  const title = req.query.title ?? '';
  const author = req.query.author ?? '';
  const review_low = req.query.review_low ?? 0;
  const review_high = req.query.review_high ?? 5;
  const published_after = req.query.published_after ?? '0000-01-01';
  const published_before = req.query.published_before ?? '9999-12-31';

  const query = `
    SELECT DISTINCT b.*, AVG(r.ReviewScore) AS AvgReviewScore
    FROM books b
    LEFT JOIN ratings r ON b.Title = r.BookTitle
    LEFT JOIN written_by wb ON b.Title = wb.Book_Title
    LEFT JOIN authors a ON wb.Author_ID = a.Author_ID
    WHERE b.Title ILIKE '%' || $1 || '%'
      AND a.Author_Name ILIKE '%' || $2 || '%'
      AND (b.publishedDate >= $3 AND b.publishedDate <= $4)
    GROUP BY b.Title
    HAVING AVG(r.ReviewScore) >= $5 AND AVG(r.ReviewScore) <= $6
    ORDER BY b.Title ASC;
  `;

  const values = [title, author, published_after, published_before, review_low, review_high];

  try {
    const { rows } = await connection.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error('Error searching books:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
// };


app.get('/users/:user_id', routes.user);

// SELECT *
// FROM users
// WHERE user_id='${userID}'


// Complex
app.get('/search_authors', routes.search_authors);

// const search_authors = async function(req, res) {
//   const name = req.query.name ?? '';
//   const min_books = req.query.min_books ?? 0;
//   const max_books = req.query.max_books ?? 10000;
//   const min_reviews = req.query.min_reviews ?? 0;
//   const max_reviews = req.query.max_reviews ?? 1000000;
//   const min_rating = req.query.min_rating ?? 0.0;
//   const max_rating = req.query.max_rating ?? 5.0;

//   const query = `
//     SELECT 
//       a.Author_ID,
//       a.Author_Name,
//       COUNT(DISTINCT wb.Book_Title) AS book_count,
//       COUNT(DISTINCT rv.ReviewID) AS review_count,
//       AVG(rt.ReviewScore) AS avg_rating
//     FROM authors a
//     LEFT JOIN written_by wb ON a.Author_ID = wb.Author_ID
//     LEFT JOIN reviews rv ON wb.Book_Title = rv.BookTitle
//     LEFT JOIN ratings rt ON wb.Book_Title = rt.BookTitle
//     WHERE a.Author_Name ILIKE '%' || $1 || '%'
//     GROUP BY a.Author_ID, a.Author_Name
//     HAVING 
//       COUNT(DISTINCT wb.Book_Title) BETWEEN $2 AND $3 AND
//       COUNT(DISTINCT rv.ReviewID) BETWEEN $4 AND $5 AND
//       AVG(rt.ReviewScore) BETWEEN $6 AND $7
//     ORDER BY a.Author_Name ASC;
//   `;

//   const values = [name, min_books, max_books, min_reviews, max_reviews, min_rating, max_rating];

//   try {
//     const { rows } = await connection.query(query, values);
//     res.json(rows);
//   } catch (err) {
//     console.error('Error searching authors:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


// Complex will also get all of authors books and list them could even put total number of author reviews
app.get('/authors/:author_id', routes.author);

// SELECT 
//   a.Author_ID,
//   a.Author_Name,
//   b.Title AS Book_Title,
//   b.Description,
//   r.ReviewID,
//   r.ReviewText,
//   r.ReviewDate,
//   u.UserID,
//   u.Name AS Reviewer_Name,
//   COUNT(DISTINCT r.UserID) OVER (PARTITION BY a.Author_ID) AS Total_Reviewers
// FROM authors a
// JOIN written_by wb ON a.Author_ID = wb.Author_ID
// JOIN books b ON wb.Book_Title = b.Title
// LEFT JOIN reviews r ON b.Title = r.BookTitle
// LEFT JOIN users u ON r.UserID = u.UserID
// WHERE a.Author_ID = $1
// ORDER BY b.Title, r.ReviewDate DESC;


app.get('/authors', routes.authors);

// SELECT Author_ID, Author_Name
// FROM authors
// ORDER BY Author_Name ASC;


app.get('/authors/:author_id/average', routes.author_average);

// SELECT 
//   a.Author_ID,
//   a.Author_Name,
//   ROUND(AVG(rt.ReviewScore), 2) AS Average_Review_Score
// FROM authors a
// JOIN written_by wb ON a.Author_ID = wb.Author_ID
// JOIN ratings rt ON wb.Book_Title = rt.BookTitle
// GROUP BY a.Author_ID, a.Author_Name
// ORDER BY Average_Review_Score DESC;


app.get('/review_leaderboard', routes.review_leaderboard);

// SELECT 
//   u.UserID,
//   u.Name AS Reviewer_Name,
//   u.Email,
//   COUNT(*) AS Total_Reviews,
//   RANK() OVER (ORDER BY COUNT(*) DESC) AS Review_Rank
// FROM reviews r
// JOIN users u ON r.UserID = u.UserID
// GROUP BY u.UserID, u.Name, u.Email
// ORDER BY Total_Reviews DESC;


// Complex
app.get('/books/:book_title/reviews', routes.book_reviews);


// SELECT 
//   r.ReviewID,
//   r.ReviewText,
//   r.ReviewDate,
//   u.UserID,
//   u.Name AS Reviewer_Name,
//   u.Email,
//   rt.ReviewScore
// FROM reviews r
// JOIN users u ON r.UserID = u.UserID
// LEFT JOIN ratings rt 
//   ON rt.BookTitle = r.BookTitle AND rt.UserID = r.UserID
// WHERE r.BookTitle = $1
// ORDER BY r.ReviewDate DESC;







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
