import { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, TextField, Box, CircularProgress } from '@mui/material';
import {NavLink} from 'react-router-dom'
const config = require('../config.json');


// Allows users to search for books
export default function BooksPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  

  /**
   * Load in initial data for search results
   */
  useEffect(() => {
    const fetchBooks = () => {
      setLoading(true);
      try{
        fetch(`http://${config.server_host}:${config.server_port}/search_books`)
        .then(res => res.json())
        .then(resJson => {
          const booksWithId = resJson.map((book) => ({ id: book.title, ...book }));
          console.log(booksWithId)
          setData(booksWithId);
        });
      } catch(error){
        console.log(error);
      }
      setLoading(false);
    }

    fetchBooks();
  }, []);

  /**
   * Called when user presses search button, searches based on input
   */
  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/search_books?title=${title}`)
      .then(res => res.json())
      .then(resJson => {
        const bookWithId = resJson.map((book) => ({ id: book.title, ...book}));
        setData(bookWithId);
      });
  }

  return (
    <Container>
      <h2>Search Books</h2>
      <Grid container spacing={6}>
        <Grid item xs={8}>
          <TextField label='Title' value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid>
          <Button onClick={() => search() } style={{ top: '50%', left: `100%`, transform: 'translateX(-50%)' }}>
            Search
          </Button>
        </Grid>
      </Grid>

      <h2>Results</h2>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
          <Grid container spacing={2}>
            {data.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book.book_id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                    <NavLink to={`/loggedin/books/${book.book_id}`}>
                      {book.title}
                    </NavLink>
                    </Typography>
                    <Typography>Ratings Count: {book.ratingscount}</Typography>
                    <Typography>Average Review: {Number(book.avgreviewscore).toFixed(2)}</Typography>

                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
      )}

    </Container>
  );
}