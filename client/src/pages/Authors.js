import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Grid, Card, CardContent,
  CircularProgress, Box, Slider, Button
} from '@mui/material';
import { NavLink } from 'react-router-dom';

function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [minBooks, setMinBooks] = useState(0);
  const [maxBooks, setMaxBooks] = useState(10);
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);

  /**
   * Load in initial author data for searches
   */
  useEffect(() => {
    const fetchAllAuthors = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8080/authors');
        const data = await res.json();
        setAuthors(data);
      } catch (err) {
        console.error('Error fetching all authors:', err);
      }
      setLoading(false);
    };
  
    fetchAllAuthors();
  }, []);

  /**
   * Searches for authors based on sliders and typed input; called when user presses search button
   */
  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        name,
        min_books: minBooks,
        max_books: maxBooks,
        min_rating: minRating,
        max_rating: maxRating
      });
      const res = await fetch(`http://localhost:8080/search_authors?${params.toString()}`);
      const data = await res.json();
      //console.log(data)
      setAuthors(data);
    } catch (err) {
      console.error('Error fetching authors:', err);
    }
    setLoading(false);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Search Authors
      </Typography>

      {/* Search Filters */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Author Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Typography gutterBottom>Books Published</Typography>
          <Box sx={{ px: 1 }}>
            <Slider
              value={[minBooks, maxBooks]}
              onChange={(e, newVal) => {
                setMinBooks(newVal[0]);
                setMaxBooks(newVal[1]);
              }}
              valueLabelDisplay="auto"
              min={0}
              max={10}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
              <Typography variant="caption">Min: {minBooks}</Typography>
              <Typography variant="caption">Max: {maxBooks}</Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Typography gutterBottom>Average Rating</Typography>
          <Box sx={{ px: 1 }}>
            <Slider
              value={[minRating, maxRating]}
              step={0.1}
              onChange={(e, newVal) => {
                setMinRating(newVal[0]);
                setMaxRating(newVal[1]);
              }}
              valueLabelDisplay="auto"
              min={0}
              max={5}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
              <Typography variant="caption">Min: {minRating}</Typography>
              <Typography variant="caption">Max: {maxRating}</Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" onClick={fetchAuthors}>
            Search
          </Button>
        </Grid>
      </Grid>

      {/* Results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {authors.map((author) => (
            <Grid item xs={12} sm={6} md={4} key={author.author_id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                  <NavLink to={`/loggedin/authors/${author.author_id}`}>
                    {author.author_name}
                  </NavLink>
                  </Typography>
                  <Typography>Books: {author.book_count}</Typography>
                  <Typography>Reviews: {author.review_count}</Typography>
                  <Typography>Avg. Rating: {Number(author.avg_rating).toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Authors;
