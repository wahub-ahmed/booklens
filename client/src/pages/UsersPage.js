import { useEffect, useState } from 'react';
import { Container, Divider, Link, Typography, TextField, Grid, Card, CardContent,
  CircularProgress, Box, Slider, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
const config = require('../config.json');


  const UsersPage = () => {
    const [users, setUsers] = useState([]);

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

      fetchUsers();
    },[])
    const reviewerColumns = [
      {
        field: 'reviewer_name',
        headerName: 'Reviewer Name',
        renderCell: (params) => (
          <NavLink
            to={`/loggedin/users/${params.userid}`}  
            style={{ textDecoration: 'none' }}
          >
            {params.reviewer_name}
          </NavLink>
        ),
      },
      {
        field: 'email',
        headerName: 'Email',
      },
      {
        field: 'total_reviews',
        headerName: 'Total Reviews',
      },
      {
        field: 'review_rank',
        headerName: 'Rank',
      }
    ];
    return (
      <Container>
        <h2>Top Reviewers Leaderboard</h2>
        {/* <LazyTable
          route={`http://${config.server_host}:${config.server_port}/review_leaderboard`}
          columns={reviewerColumns}
        /> */}

          <Grid container spacing={2}>
            {users.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.userid}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                    <NavLink to={`/loggedin/users/${user.userid}`}>
                      {user.reviewer_name}
                    </NavLink>
                    </Typography>
                    <Typography>Email: {user.email}</Typography>
                    {/* <Typography>Average Review: {Number(book.AvgReviewScore).toFixed(2)}</Typography> */}
                    <Typography>Total Reviews: {user.total_reviews}</Typography>
                    <Typography>Review Rank: {user.review_rank}</Typography>

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

