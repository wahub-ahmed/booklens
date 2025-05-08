import { useEffect, useState } from 'react';
import { Container, Divider, Link, Typography, TextField, Grid, Card, CardContent,
  CircularProgress, Box, Slider, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
const config = require('../config.json');

export default function HomePage() {

  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  
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

  const bookColumns = [
    {
      field: 'title',
      headerName: 'Book Title',
      renderCell: (row) => <NavLink to={`books/${row.book_id}`}>{row.title}</NavLink> // A Link component is used just for formatting purposes
    },
    {
      field: 'ratingscount',
      headerName: '# of Ratings', // A NavLink component is used to create a link to the album page
    },
    {
      field: 'avgreviewscore',
      headerName: 'Review Score'
    }
  ]; 



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