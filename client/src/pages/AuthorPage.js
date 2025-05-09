import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  Container, Typography, Card, CardContent, Divider, Grid,
} from '@mui/material';

// This page is used to display infomraiton for a given author
export default function AuthorPage() {
  const { author_id } = useParams();
  const [authorData, setAuthorData] = useState([]); 
  const [loading, setLoading] = useState(true);

  /**
   * Fetch data for an author given author_id
   */
  useEffect(() => {
    fetch(`http://localhost:8080/authors/${author_id}`)
      .then(res => res.json())
      .then(data => {
        setAuthorData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [author_id]);

  // Display loading while data is being fetched
  if (loading) return <Typography>Loading...</Typography>;
  if (!authorData.length) return <Typography>No data found.</Typography>;

  const authorName = authorData[0].author_name;
  const totalReviewers = authorData[0].total_reviewers;

  // Group books by book ID
  const booksMap = new Map();
  authorData.forEach(entry => {
    const key = entry.book_id;
    if (!booksMap.has(key)) {
      booksMap.set(key, {
        title: entry.book_title,
        description: entry.description,
      });
    }
  });

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>{authorName}</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Total Unique Reviewers: {totalReviewers}
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Typography variant="h5" gutterBottom>Books by {authorName}</Typography>
      <Grid container spacing={3}>
        {[...booksMap.entries()].map(([bookId, { title, description }]) => (
          <Grid item xs={12} md={6} key={bookId}>
            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <NavLink to={`/loggedin/books/${bookId}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                    {title}
                  </NavLink>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {description || 'No description available.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
