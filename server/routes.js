const { Pool, types } = require('pg');
const config = require('./config.json')

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, val => parseInt(val, 10)); //DO NOT DELETE THIS

// Create PostgreSQL connection using database credentials provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
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

/******************
 * WARM UP ROUTES *
 ******************/

// New Routes for DB

const user = async function(req, res) {
  const userid = req.params.user_id

    connection.query(`
      SELECT *
      FROM users
      WHERE userid='${userid}'`, (err, data) => {
        if (err){
          console.log(err)
          res.json({})
        } else {
          console.log(data.rows[0])
          console.log(data.rows[1])
          res.json(data.rows)
        }
      })


}


const top_books = async function(req, res){
  const page = req.query.page;
  const pageSize = page ? page : 10;
  
  if (!page) {
    connection.query(`SELECT b.book_id, b.Title, b.Description, b.image, b.previewLink, b.publisher, b.publishedDate, b.infoLink,b.categories, b.ratingsCount, AVG(r.ReviewScore) AS AvgReviewScore
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
    
     connection.query(`SELECT b.book_id, b.Title, b.Description, b.image, b.previewLink, b.publisher, b.publishedDate, b.infoLink,b.categories, b.ratingsCount, AVG(r.ReviewScore) AS AvgReviewScore
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

const top_authors = async function(req, res){
  const page = req.query.page;
  const pageSize = page ? page : 10;

  if (!page) {
    connection.query(`
      WITH author_avg_scores AS (
        SELECT
            wb.Author_ID,
            a.Author_Name,
            AVG(r.ReviewScore) AS avg_score,
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
            AVG(r.ReviewScore) AS avg_score,
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



const search_books = async function(req, res){
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
}

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

const author = async function (req, res){
  const authorid = req.params.author_id
  connection.query(`SELECT 
  a.Author_ID,
  a.Author_Name,
  b.Title AS Book_Title,
  b.Description,
  r.ReviewID,
  r.ReviewText,
  r.ReviewDate,
  u.UserID,
  u.Name AS Reviewer_Name,
  COUNT(DISTINCT r.UserID) OVER (PARTITION BY a.Author_ID) AS Total_Reviewers
  FROM authors a
  JOIN written_by wb ON a.Author_ID = wb.Author_ID
  JOIN books b ON wb.Book_Title = b.Title
  LEFT JOIN reviews r ON b.Title = r.BookTitle
  LEFT JOIN users u ON r.UserID = u.UserID
  WHERE a.Author_ID = $1
  ORDER BY b.Title, r.ReviewDate DESC;`, (data, err) => {
  if (err) {
    console.log(err);
    res.json({})
  } else if (!data){
    res.json({})
  } else {
    res.json(data.rows)
  }
})
}

const authors = async function (req, res){
  connection.query(`SELECT *
                    FROM authors
                    ORDER BY author_name`, (err, data) => {
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

    // const oldQuery = `
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
    // WHERE r.BookTitle = '${book_title}'
    // ORDER BY r.ReviewDate DESC;
    // `
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
                    FROM books
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




// Route 1: GET /author/:type
// const author = async function(req, res) {
//   // TODO (TASK 1): replace the values of name and pennkey with your own
//   const name = 'Drew Buck';
//   const pennkey = 'drewbuck';

//   // checks the value of type in the request parameters
//   // note that parameters are required and are specified in server.js in the endpoint by a colon (e.g. /author/:type)
//   if (req.params.type === 'name') {
//     // res.json returns data back to the requester via an HTTP response
//     res.json({ data: name });
//   } else if (req.params.type === 'pennkey') {
//     res.json({data: pennkey});
//     // TODO (TASK 2): edit the else if condition to check if the request parameter is 'pennkey' and if so, send back a JSON response with the pennkey
//   } else {
//     res.status(400).json({});
//   }
// }

// Route 2: GET /random
const random = async function(req, res) {
  // you can use a ternary operator to check the value of request query values
  // which can be particularly useful for setting the default value of queries
  // note if users do not provide a value for the query it will be undefined, which is falsey
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  // Here is a complete example of how to query the database in JavaScript.
  // Only a small change (unrelated to querying) is required for TASK 3 in this route.
  connection.query(`
    SELECT *
    FROM Songs
    WHERE explicit <= ${explicit}
    ORDER BY RANDOM()
    LIMIT 1
  `, (err, data) => {
    if (err) {
      // If there is an error for some reason, print the error message and
      // return an empty object instead
      console.log(err);
      // Be cognizant of the fact we return an empty object {}. For future routes, depending on the
      // return type you may need to return an empty array [] instead.
      res.json({});
    } else {
      // Here, we return results of the query as an object, keeping only relevant data
      // being song_id and title which you will add. In this case, there is only one song
      // so we just directly access the first element of the query results array (data.rows[0])
      // TODO (TASK 3): also return the song title in the response
      res.json({
        song_id: data.rows[0].song_id,
        title: data.rows[0].title
      });
    }
  });
}

/********************************
 * BASIC SONG/ALBUM INFO ROUTES *
 ********************************/

// Route 3: GET /song/:song_id
const song = async function(req, res) {
  const songID = req.params.song_id;
  // TODO (TASK 4): implement a route that given a song_id, returns all information about the song
  // Hint: unlike route 2, you can directly SELECT * and just return data.rows[0]
  // Most of the code is already written for you, you just need to fill in the query
  connection.query(`SELECT *
                    FROM songs
                    WHERE song_id='${songID}'`, (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else {
      res.json(data.rows[0]);
    }
  });
}

// Route 4: GET /album/:album_id
const album = async function(req, res) {
  const album_id = req.params.album_id;
  connection.query(`SELECT *
                    FROM albums
                    WHERE album_id='${album_id}'`, (err, data) => {
    if (err){
      console.log(err);
      res.json({});
    } else {
      res.json(data.rows[0])
    }
  });
  // TODO (TASK 5): implement a route that given a album_id, returns all information about the album
 // replace this with your implementation
}

// Route 5: GET /albums
const albums = async function(req, res) {
  // TODO (TASK 6): implement a route that returns all albums ordered by release date (descending)
  // Note that in this case you will need to return multiple albums, so you will need to return an array of objects
  connection.query(`SELECT *
                    FROM albums
                    ORDER BY release_date DESC`, (err, data) => {
                      if (err){
                        console.log(err)
                        res.json({});
                      } else{
                        res.json(data.rows)
                      }
                    })
   // replace this with your implementation
}

// Route 6: GET /album_songs/:album_id
const album_songs = async function(req, res) {
  const albumID = req.params.album_id;

  connection.query(`SELECT songs.song_id, songs.title, songs.number, songs.duration, plays
                    FROM albums JOIN songs ON albums.album_id=songs.album_id
                    WHERE songs.album_id='${albumID}'
                    ORDER BY songs.number ASC`, (err, data) => {
      if (err){
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows)
      }

  })
  // TODO (TASK 7): implement a route that given an album_id, returns all songs on that album ordered by track number (ascending)
  ; // replace this with your implementation
}

/************************
 * ADVANCED INFO ROUTES *
 ************************/

// Route 7: GET /top_songs
const top_songs = async function(req, res) {
  const page = req.query.page;
  // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
  const pageSize = page ? page : 10;
  

  if (!page) {
    connection.query(`SELECT songs.song_id AS song_id, songs.title AS title, songs.album_id AS album_id, albums.title AS album, plays
                      FROM songs JOIN albums ON songs.album_id=albums.album_id
                      ORDER BY plays DESC`, (err, data) => {
      if (!data) {
        console.log("No data here")
        res.json({})
      } else {
        res.json(data.rows)
      }
      

    })
    // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
    // Hint: you will need to use a JOIN to get the album title as well
     // replace this with your implementation
  } else {
    const page_size = req.query.page_size ?? 10;
    const start = (page - 1) * page_size;
    
    // TODO (TASK 10): reimplement TASK 9 with pagination
    // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)
     // replace this with your implementation
     connection.query(`SELECT songs.song_id AS song_id, songs.title AS title, songs.album_id AS album_id, albums.title AS album, plays
      FROM songs JOIN albums ON songs.album_id=albums.album_id
      ORDER BY plays DESC
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

// Route 8: GET /top_albums
const top_albums = async function(req, res) {
  const page = req.query.page;
  // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
  const pageSize = page ? page : 10;
  

  if (!page) {
    connection.query(`SELECT albums.album_id AS album_id, albums.title AS title, SUM(plays) AS plays
                      FROM songs JOIN albums ON songs.album_id=albums.album_id
                      GROUP BY albums.album_id, albums.title
                      ORDER BY plays DESC`, (err, data) => {
      if (!data) {
        console.log("No data here")
        res.json({})
      } else {
        res.json(data.rows)
      }
      

    })
    // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
    // Hint: you will need to use a JOIN to get the album title as well
     // replace this with your implementation
  } else {
    
    const page_size = req.query.page_size ?? 10;
    const start = (page - 1) * page_size;
    // TODO (TASK 10): reimplement TASK 9 with pagination
    // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)
     // replace this with your implementation
     connection.query(`SELECT albums.album_id AS album_id, albums.title AS title, SUM(plays) AS plays
                      FROM songs JOIN albums ON songs.album_id=albums.album_id
                      GROUP BY albums.album_id, albums.title
                      ORDER BY plays DESC
                      LIMIT ${page_size} OFFSET ${start}`, (err, data) => {
    if (!data) {
      console.log("No data here")
    res.json({})    
    } else {
      res.json(data.rows)
    }
  })
}

  // TODO (TASK 11): return the top albums ordered by aggregate number of plays of all songs on the album (descending), with optional pagination (as in route 7)
  // Hint: you will need to use a JOIN and aggregation to get the total plays of songs in an album
}

// Route 9: GET /search_songs
const search_songs = async function(req, res) {
  // TODO (TASK 12): return all songs that match the given search query with parameters defaulted to those specified in API spec ordered by title (ascending)
  // Some default parameters have been provided for you, but you will need to fill in the rest
  const title = req.query.title ?? '';
  const durationLow = req.query.duration_low ?? 60;
  const durationHigh = req.query.duration_high ?? 660;
  const plays_low = req.query.plays_low ?? 0;
  const plays_high = req.query.plays_high ?? 1100000000;
  const danceability_low = req.query.danceability_low ?? 0;
  const danceability_high = req.query.danceability_high ?? 1;
  const energy_low = req.query.energy_low ?? 0;
  const energy_high = req.query.energy_high ?? 1;
  const valence_low = req.query.valence_low ?? 0;
  const valence_high = req.query.valence_high ?? 1;
  const explicit_new = req.query.explicit ?? false;
  console.log(explicit_new);

  if (explicit_new == false || explicit_new == "false"){
    console.log("HERE")
    connection.query(`SELECT DISTINCT *
                      FROM songs
                      WHERE explicit = 0 and title like '%${title}%'
                      and energy <= ${energy_high} and energy >= ${energy_low}
                      and valence <= ${valence_high} and valence >= ${valence_low}
                      and danceability <= ${danceability_high} and danceability >= ${danceability_low}
                      and plays <= ${plays_high} and plays >= ${plays_low}
                      and duration <= ${durationHigh} and duration >= ${durationLow}`, (err, data) => {
    if (!data){
      console.log(err);
      console.log("explicit is false err");
      res.json({});
    } else {
      console.log("explicit is false");
      res.json(data.rows)
    }
      
    });
  } else {
    console.log("IN true")
    connection.query(`SELECT DISTINCT *
                      FROM songs
                      WHERE title like '%${title}%'
                      and energy <= ${energy_high} and energy >= ${energy_low}
                      and valence <= ${valence_high} and valence >= ${valence_low}
                      and danceability <= ${danceability_high} and danceability >= ${danceability_low}
                      and plays <= ${plays_high} and plays >= ${plays_low}
                      and duration <= ${durationHigh} and duration >= ${durationLow}`, (err, data) => {
           if (!data){
              console.log("No data");
              res.json({});
            } else {
              res.json(data.rows)
        }                 
      
    });
  }
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
