import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';
const config = require('../config.json');

const User = () => {
  const { user_id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [reviewerName, setReviewerName] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/users/${user_id}`)
      .then(response => response.json())
      .then(data => {
        setReviews(data);
        if (data.length > 0 && data[0].reviewer_name) {
          setReviewerName(data[0].reviewer_name);
        }
      })
      .catch(error => console.error('Error fetching user reviews:', error));
  }, [user_id]);

  return (
    <Container>
      <Typography variant="h5" gutterBottom sx={{ pt: 4 }}>
        {reviewerName ? `${reviewerName}'s Reviews` : 'User Reviews'}
      </Typography>
      <List>
        {reviews.map((review, index) => (
          <ListItem key={index} alignItems="flex-start">
            <ListItemText
              primary={`${review.booktitle} by ${review.authorname}`}
              secondary={
                <>
                  <Typography variant="body2" component="span">{review.reviewtext}</Typography>
                  <br />
                  <Typography variant="body2" color="text.secondary">
                    Rating: {review.reviewscore || 'N/A'}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};


export default User;
