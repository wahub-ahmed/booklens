import { useEffect, useState } from 'react';
import { Container, Divider, Link, Typography, TextField, Grid, Card, CardContent,
  CircularProgress, Box, Slider, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
const config = require('../config.json');

// Displays a leaderboard of most reviews, and leaderboard of who leaves reviews under a books average
  const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [worst, setWorst] = useState([]);

    /**
     * Fetch data for top reviewers (most reviews) and worst reviewers (reviews below average)
     */
    useEffect(() => {
      const fetchUsers = async () => {
        try{
          const response = await fetch(`http://${config.server_host}:${config.server_port}/review_leaderboard`);
          const data = await response.json();
          setUsers(data);
        } catch(error){
          console.log("Error:", error)
        }
      }
      
      const fetchWorst = async () => {
        try{
          const response = await fetch(`http://${config.server_host}:${config.server_port}/worst_reviewers`);
          const data = await response.json();
          setWorst(data);
        } catch(error){
          console.log(error);
        }
      }
      
      fetchUsers();
      fetchWorst();
    },[])


    return (
      <Container>
        <h2>Top Reviewers Leaderboard</h2>

        <Grid container spacing={2}>
            {users.slice(0,18).map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.userid}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <NavLink to={`/loggedin/users/${user.userid}`}>
                        {user.reviewer_name}
                      </NavLink>
                    </Typography>
                    <Typography>Email: {user.email}</Typography>
                    <Typography>Total Reviews: {user.total_reviews}</Typography>
                    <Typography>Review Rank: {user.review_rank}</Typography>

                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        <Divider />

        <h2>Worst Reviewers</h2>

        <Grid container spacing={2}>
            {worst.slice(0,18).map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.userid}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <NavLink to={`/loggedin/users/${user.userid}`}>
                        {user.reviewername}
                      </NavLink>
                    </Typography>
                    <Typography>Reviews Under a Books Average: {user.count}</Typography>
                    <Typography>Average Review: {Number(user.avgreviewscore).toFixed(2)}</Typography>

                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        <Divider />

      </Container>
    );
  };


export default UsersPage

