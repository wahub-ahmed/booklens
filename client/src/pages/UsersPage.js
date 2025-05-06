import { useEffect, useState } from 'react';
import { Container, Divider, Link } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
const config = require('../config.json');


const reviewerColumns = [
    {
      field: 'reviewer_name',
      headerName: 'Reviewer Name',
      renderCell: (params) => (
        <Link
          component={NavLink}
          to={`/loggedin/users/${params.row.userid}`}
          style={{ textDecoration: 'none' }}
        >
          {params.row.reviewer_name}
        </Link>
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

  const UsersPage = () => {
    return (
      <Container>
        <h2>Top Reviewers Leaderboard</h2>
        <LazyTable
          route={`http://${config.server_host}:${config.server_port}/review_leaderboard`}
          columns={reviewerColumns}
        />
        <Divider />
      </Container>
    );
  };


export default UsersPage

