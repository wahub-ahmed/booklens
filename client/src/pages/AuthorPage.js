import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Card, CardContent, Divider, Box, Grid, Paper,
} from '@mui/material';

export default function AuthorPage() {
  const { author_id } = useParams();
  const [authorData, setAuthorData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Typography>Loading...</Typography>;
  if (!authorData.length) return <Typography>No data found.</Typography>;

  const authorName = authorData[0].author_name;
  const totalReviewers = authorData[0].total_reviewers;

  // Group reviews by book title
  const booksMap = new Map();
  authorData.forEach(entry => {
    if (!booksMap.has(entry.book_title)) {
      booksMap.set(entry.book_title, {
        description: entry.description,
        reviews: [],
      });
    }
    if (entry.reviewid) {
      booksMap.get(entry.book_title).reviews.push({
        text: entry.reviewtext,
        date: entry.reviewdate,
        reviewer: entry.reviewer_name,
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
        
        {[...booksMap.entries()].map(([title, { description, reviews }]) => (
          <Grid item xs={12} md={6} key={title}>
            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Typography variant="body2" paragraph color="text.secondary">
                  {description || 'No description available.'}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2">Reviews:</Typography>
                {reviews.length ? reviews.map((r, idx) => (
                  <Paper key={idx} sx={{ p: 1.5, my: 1, bgcolor: 'grey.100' }}>
                    <Typography variant="body2" fontStyle="italic">
                      “{r.text}”
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      — {r.reviewer || 'Anonymous'}, {new Date(r.date).toLocaleDateString()}
                    </Typography>
                  </Paper>
                )) : (
                  <Typography variant="body2" color="text.secondary">No reviews yet.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        
      </Grid>
    </Container>
  );
}
