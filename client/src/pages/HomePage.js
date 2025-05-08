import { useEffect, useState } from 'react';
import { Container, Divider, Typography, Grid, Card, CardContent } from '@mui/material';
import { NavLink } from 'react-router-dom';

const config = require('../config.json');

export default function HomePage() {

  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  
  /**
   * Fetch data for top authors and top books
   */
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch(`http://${config.server_host}:${config.server_port}/top_authors`);
        const data = await response.json();
        setAuthors(data);
      } catch (error) {
        console.error("Error fetching authors:", error);
      }
    };

    const fetchBooks = async () => {
      try {
        const response = await fetch(`http://${config.server_host}:${config.server_port}/top_books`);
        const data = await response.json();
        setBooks(data);
      } catch (error){
        console.log("Error:", error)
      }
    }
  
    fetchAuthors();
    fetchBooks();
  }, []);


  return (
    <Container>
      <Divider />
      <h2>Top Books</h2>
      
        <Grid container spacing={2}>
            {books.slice(0,12).map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book.book_id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                    <NavLink to={`/loggedin/books/${book.book_id}`}>
                      {book.title}
                    </NavLink>
                    </Typography>
                    <Typography>Ratings Count: {book.ratingscount}</Typography>
                    {/* <Typography>Average Review: {Number(book.AvgReviewScore).toFixed(2)}</Typography> */}
                    <Typography>Average Review: {Number(book.avgreviewscore).toFixed(2)}</Typography>


                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
      <Divider />

      <Divider />
      <h2>Top Authors</h2>
        <Grid container spacing={2}>
          {authors.slice(0,12).map((author) => (
            <Grid item xs={12} sm={6} md={4} key={author.author_id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                  <NavLink to={`/loggedin/authors/${author.author_id}`}>
                    {author.author_name}
                  </NavLink>
                  </Typography>
                  <Typography>Books: {author.book_count}</Typography>
                  <Typography>Reviews: {author.total_ratings}</Typography>
                  <Typography>Avg. Rating: {Number(author.avg_score).toFixed(2)}</Typography>

                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

      <Divider />
    </Container>
  );
};