const { Pool, types } = require('pg');
const config = require('./config.json')

types.setTypeParser(20, val => parseInt(val, 10)); //DO NOT DELETE THIS

const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});
connection.connect((err) => err && console.log(err));


// User route finds user based on user id
const user = async function(req, res) {
  const userid = req.params.user_id;

  const query = `
      SELECT 
      u.name AS reviewer_name,
      b.Title AS BookTitle,
      a.Author_Name AS AuthorName,
      r.ReviewText,
      ra.ReviewScore
    FROM reviews r
    JOIN books b ON r.BookTitle = b.Title
    LEFT JOIN written_by wb ON b.Title = wb.Book_Title
    LEFT JOIN authors a ON wb.Author_ID = a.Author_ID
    LEFT JOIN ratings ra ON r.BookTitle = ra.BookTitle AND r.UserID = ra.UserID
    JOIN users u ON r.UserID = u.UserID
    WHERE r.UserID = $1
  `;
  connection.query(query, [userid], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json(data.rows);
    }
  });
};


// top_books route finds top 12 rated books, ordered by average review and ratings count
const top_books = async function(req, res){
  const page = req.query.page;
  const pageSize = page ? page : 10;
  
  if (!page) {
    connection.query(`SELECT b.book_id, b.Title, b.Description, b.image, b.previewLink, b.publisher, b.publishedDate, b.infoLink,b.categories, b.ratingsCount, ROUND(AVG(r.ReviewScore),2) AS AvgReviewScore
    FROM
        books b
    JOIN
        ratings r ON b.Title = r.BookTitle
    GROUP BY
        b.book_id, b.Title, b.Description, b.image, b.previewLink, b.publisher,
        b.publishedDate, b.infoLink, b.categories, b.ratingsCount
    ORDER BY
        AvgReviewScore DESC,
        ratingsCount DESC
    LIMIT 12
        `, (err, data) => {
      if (!data) {
        console.log("No data here")
        console.log(data)
        res.json({})
      } else {
        res.json(data.rows)
      }
      

    })
   
  } else {
    const page_size = req.query.page_size ?? 10;
    const start = (page - 1) * page_size;
    
     connection.query(`SELECT b.book_id, b.Title, b.Description, b.image, b.previewLink, b.publisher, b.publishedDate, b.infoLink,b.categories, b.ratingsCount, ROUND(AVG(r.ReviewScore),2) AS AvgReviewScore
     FROM
         books b
     JOIN
         ratings r ON b.Title = r.BookTitle
     GROUP BY
         b.book_id, b.Title, b.Description, b.image, b.previewLink, b.publisher,
         b.publishedDate, b.infoLink, b.categories, b.ratingsCount
     ORDER BY
         AvgReviewScore DESC,
         ratingsCount DESC
      LIMIT ${page_size} OFFSET ${start}`, (err, data) => {
    if (!data) {
      console.log("No data here")
    res.json({})    
    } else {
      res.json(data.rows)
    }
  })
}
}

// finds authors ordered by total ratings, total books, and average score
const top_authors = async function(req, res){
  const page = req.query.page;
  const pageSize = page ? page : 10;

  if (!page) {
    connection.query(`
      WITH author_avg_scores AS (
        SELECT
            wb.Author_ID,
            a.Author_Name,
            ROUND(AVG(r.ReviewScore), 2) AS avg_score,
            COUNT(DISTINCT wb.Book_Title) AS book_count,
            COUNT(r.ReviewScore) AS total_ratings
        FROM
            written_by wb
            JOIN authors a ON wb.Author_ID = a.Author_ID
            JOIN ratings r ON wb.Book_Title = r.BookTitle
        GROUP BY
            wb.Author_ID, a.Author_Name
      ),
      max_score AS (
        SELECT MAX(avg_score) AS top_avg_score
        FROM author_avg_scores
      )
      SELECT
          a.Author_ID,
          a.Author_Name,
          a.avg_score,
          a.book_count,
          a.total_ratings
      FROM
          author_avg_scores a
          JOIN max_score m ON a.avg_score = m.top_avg_score
      ORDER BY
        a.total_ratings DESC,
        a.book_count DESC,
        a.avg_score DESC
    `, (err, data) => {
      if (!data) {
        console.log("No data here")
        res.json({})
      } else {
        res.json(data.rows)
      }
    });

  } else {
    const page_size = req.query.page_size ?? 10;
    const start = (page - 1) * page_size;

    connection.query(`
      WITH author_avg_scores AS (
        SELECT
            wb.Author_ID,
            a.Author_Name,
            ROUND(AVG(r.ReviewScore), 2) AS avg_score,
            COUNT(DISTINCT wb.Book_Title) AS book_count,
            COUNT(r.ReviewScore) AS total_ratings
        FROM
            written_by wb
            JOIN authors a ON wb.Author_ID = a.Author_ID
            JOIN ratings r ON wb.Book_Title = r.BookTitle
        GROUP BY
            wb.Author_ID, a.Author_Name
      ),
      max_score AS (
        SELECT MAX(avg_score) AS top_avg_score
        FROM author_avg_scores
      )
      SELECT
          a.Author_ID,
          a.Author_Name,
          a.avg_score,
          a.book_count,
          a.total_ratings
      FROM
          author_avg_scores a
          JOIN max_score m ON a.avg_score = m.top_avg_score
      ORDER BY
          a.total_ratings DESC,
          a.book_count DESC,
          a.avg_score DESC
      LIMIT ${page_size} OFFSET ${start}
    `, (err, data) => {
      if (!data) {
        console.log("No data here")
        res.json({})    
      } else {
        res.json(data.rows)
      }
    });
  }
}


// finds books based on name
const search_books = async function(req, res){
  const title = req.query.title ?? '';
  const author = req.query.author ?? '';
  const review_low = req.query.review_low ?? 0;
  const review_high = req.query.review_high ?? 5;
  const published_after = req.query.published_after ?? '0000-01-01';
  const published_before = req.query.published_before ?? '9999-12-31';

  const query = `
    SELECT DISTINCT b.book_id as book_id, b.Title,b.categories,b.ratingsCount, AVG(r.ReviewScore) AS AvgReviewScore
    FROM books b
    LEFT JOIN ratings r ON b.Title = r.BookTitle
    LEFT JOIN written_by wb ON b.Title = wb.Book_Title
    LEFT JOIN authors a ON wb.Author_ID = a.Author_ID
    WHERE b.Title ILIKE '%' || $1 || '%'
      AND a.Author_Name ILIKE '%' || $2 || '%'
      AND (b.publishedDate >= $3 AND b.publishedDate <= $4)
    GROUP BY b.book_id, b.Title
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
}
// finds authors based on some criteria
const search_authors = async function (req, res){
    const name = req.query.name ?? '';
    const min_books = req.query.min_books ?? 0;
    const max_books = req.query.max_books ?? 10000;
    const min_reviews = req.query.min_reviews ?? 0;
    const max_reviews = req.query.max_reviews ?? 1000000;
    const min_rating = req.query.min_rating ?? 0.0;
    const max_rating = req.query.max_rating ?? 5.0;
    const title = req.query.title ?? '';

    const query = `
      SELECT 
        a.Author_ID,
        a.Author_Name,
        COUNT(DISTINCT wb.Book_Title) AS book_count,
        COUNT(DISTINCT rv.ReviewID) AS review_count,
        AVG(rt.ReviewScore) AS avg_rating
      FROM authors a
      LEFT JOIN written_by wb ON a.Author_ID = wb.Author_ID
      LEFT JOIN reviews rv ON wb.Book_Title = rv.BookTitle
      LEFT JOIN ratings rt ON wb.Book_Title = rt.BookTitle
      WHERE a.Author_Name ILIKE '%' || '${name}' || '%'
      GROUP BY a.Author_ID, a.Author_Name
      HAVING 
        COUNT(DISTINCT wb.Book_Title) BETWEEN '${min_books}' AND '${max_books}' AND
        COUNT(DISTINCT rv.ReviewID) BETWEEN '${min_reviews}' AND '${max_reviews}' AND
        AVG(rt.ReviewScore) BETWEEN '${min_rating}' AND '${max_rating}'
      ORDER BY a.Author_Name ASC;
    `;
  
  
    try {
      const { rows } = await connection.query(query);
      res.json(rows);
    } catch (err) {
      console.error('Error searching authors:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
 // Finds an author based on its id
  const author = async function (req, res) {
    const authorid = req.params.author_id;
    const query = `
    SELECT 
      a.Author_ID,
      a.Author_Name,
      b.Book_ID,
      b.Title AS Book_Title,
      b.Description,
      r.ReviewID,
      r.ReviewText,
      r.ReviewDate,
      u.UserID,
      u.Name AS Reviewer_Name,
      sub.Total_Reviewers
    FROM authors a
    JOIN written_by wb ON a.Author_ID = wb.Author_ID
    JOIN books b ON wb.Book_Title = b.Title
    LEFT JOIN reviews r ON b.Title = r.BookTitle
    LEFT JOIN users u ON r.UserID = u.UserID
    LEFT JOIN (
      SELECT a.Author_ID, COUNT(DISTINCT r.UserID) AS Total_Reviewers
      FROM authors a
      JOIN written_by wb ON a.Author_ID = wb.Author_ID
      JOIN reviews r ON wb.Book_Title = r.BookTitle
      GROUP BY a.Author_ID
    ) sub ON sub.Author_ID = a.Author_ID
    WHERE a.Author_ID = $1
    ORDER BY b.Title, r.ReviewDate DESC;
    `;
  
    try {
      const { rows } = await connection.query(query, [authorid]);
      if (!rows || rows.length === 0) {
        res.status(404).json([]);
      }
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
// The initial query for when the authors page is loaded in
// It grabs all the authors
const authors = async function (req, res){
  connection.query(`SELECT 
  a.Author_ID,
  a.Author_Name,
  COALESCE(b.book_count, 0) AS book_count,
  COALESCE(rv.review_count, 0) AS review_count,
  COALESCE(rt.avg_rating, 0) AS avg_rating
FROM authors a
LEFT JOIN (
  SELECT Author_ID, COUNT(DISTINCT Book_Title) AS book_count
  FROM written_by
  GROUP BY Author_ID
) b ON a.Author_ID = b.Author_ID
LEFT JOIN (
  SELECT wb.Author_ID, COUNT(*) AS review_count
  FROM written_by wb
  JOIN reviews r ON wb.Book_Title = r.BookTitle
  GROUP BY wb.Author_ID
) rv ON a.Author_ID = rv.Author_ID
LEFT JOIN (
  SELECT wb.Author_ID, ROUND(AVG(rt.ReviewScore), 2) AS avg_rating
  FROM written_by wb
  JOIN ratings rt ON wb.Book_Title = rt.BookTitle
  GROUP BY wb.Author_ID
) rt ON a.Author_ID = rt.Author_ID
ORDER BY a.Author_Name
LIMIT 2000;
`, (err, data) => {
      if (err){
        console.log(err)
        res.json({})
      } else if (!data){
        res.json({})
      } else {
        res.json(data.rows)
      }

  })
}

const author_average = async function (req, res){
  connection.query(`
  SELECT 
  a.Author_ID,
  a.Author_Name,
  ROUND(AVG(rt.ReviewScore), 2) AS Average_Review_Score
  FROM authors a
  JOIN written_by wb ON a.Author_ID = wb.Author_ID
  JOIN ratings rt ON wb.Book_Title = rt.BookTitle
  GROUP BY a.Author_ID, a.Author_Name
  ORDER BY Average_Review_Score DESC;
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else {
      res.json(data.rows);   
    }
  });
}

const review_leaderboard = async function (req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    connection.query(`
      SELECT 
        u.UserID,
        u.Name AS Reviewer_Name,
        u.Email,
        COUNT(*) AS Total_Reviews,
        RANK() OVER (ORDER BY COUNT(*) DESC) AS Review_Rank
      FROM reviews r
      JOIN users u ON r.UserID = u.UserID
      GROUP BY u.UserID, u.Name, u.Email
      ORDER BY Total_Reviews DESC
      LIMIT 1000
    `, (err, data) => {
      if (err || !data) {
        console.log("Error or no data");
        return res.status(500).json({ error: "Database error or no data" });
      } else {
        return res.json(data.rows);
      }
    });
  } else {
    const start = (page - 1) * pageSize;

    connection.query(`
      SELECT * FROM (
        SELECT 
          u.UserID,
          u.Name AS Reviewer_Name,
          u.Email,
          COUNT(*) AS Total_Reviews,
          RANK() OVER (ORDER BY COUNT(*) DESC) AS Review_Rank
        FROM reviews r
        JOIN users u ON r.UserID = u.UserID
        GROUP BY u.UserID, u.Name, u.Email
      ) AS ranked_reviewers
      ORDER BY Total_Reviews DESC
      LIMIT ${pageSize} OFFSET ${start}
    `, (err, data) => {
      if (err || !data) {
        console.log("Error or no data");
        return res.status(500).json({ error: "Database error or no data" });
      } else {
        return res.json(data.rows);
      }
    });
  }
};


const book_reviews = async function (req, res){
  const book_id = req.params.book_id
  const new_query = `WITH selected_book AS (SELECT * FROM books
                                  WHERE book_id='${book_id}')
SELECT
      r.ReviewID,
      r.ReviewText,
      r.ReviewDate,
      u.UserID,
      u.Name AS Reviewer_Name,
      u.Email,
      rt.ReviewScore,
      selected_book.title
    FROM selected_book JOIN reviews r ON selected_book.title=r.booktitle
    JOIN users u ON r.UserID = u.UserID
    LEFT JOIN ratings rt
      ON rt.BookTitle = r.BookTitle AND rt.UserID = r.UserID
    ORDER BY r.ReviewDate DESC;`

  connection.query(new_query, (err, data) => {

      if (err) {
        console.log(err)
        res.json({});
      } else if (!data){
        console.log("No data here!")
        res.json({});
      } else {
        res.json(data.rows);
      }

    })
}

const book = async function (req, res){
  const book_id = req.params.book_id

  connection.query(`SELECT *
                    FROM books JOIN written_by w ON w.book_title=books.title JOIN authors a ON a.author_id=w.author_id
                    WHERE book_id='${book_id}'`, (err, data) => {
      if (err){
        console.log(err)
        res.json({})
      } else if (!data){
        res.json({})
      } else {
        res.json(data.rows[0])
      }

  })
}


module.exports = {
  top_books,
  top_authors,
  book,
  search_books,
  search_authors,
  author,
  authors,
  author_average,
  review_leaderboard,
  book_reviews,
  user
}
