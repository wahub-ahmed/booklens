import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, CircularProgress } from '@mui/material';
import config from '../config.json';

const User = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/user/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (!user || Object.keys(user).length === 0) {
    return (
      <Container>
        <Typography variant="h5">User not found.</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>{user.name}</Typography>
      <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
      <Typography variant="body1"><strong>Joined:</strong> {user.join_date}</Typography>
      {/* Add more fields as needed */}
    </Container>
  );
};

export default User;
