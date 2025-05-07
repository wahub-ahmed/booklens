import { useEffect, useState } from 'react';
import { Container, Divider, Link } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
const config = require('../config.json');

export default function HomePage() {
  // const [songOfTheDay, setSongOfTheDay] = useState({});
  // const [selectedSongId, setSelectedSongId] = useState(null);


  const [author, setAuthor] = useState('');

  useEffect(() => {
    // fetch(`http://${config.server_host}:${config.server_port}/random`)
    //   .then(res => res.json())
    //   .then(resJson => setSongOfTheDay(resJson));

    fetch(`http://${config.server_host}:${config.server_port}/author/name`)
      .then(res => res.json())
      .then(resJson => setAuthor(resJson.data))
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

  const authorColumns = [
    {
      field: 'author_name',
      headerName: 'Author',
      // renderCell: (row) => <Link onClick={() => setSelectedSongId(row.song_id)}>{row.title}</Link> // A Link component is used just for formatting purposes
    },
    {
      field: 'total_ratings',
      headerName: '# of Ratings', // A NavLink component is used to create a link to the album page
    },
    {
      field: 'book_count',
      headerName: 'Books Written'
    },
    {
      field: 'avg_score',
      headerName: 'Average Score'
    },
  ];


  const albumColumns = [
    {
      field: 'title',
      headerName: 'Album Title',
      renderCell: (row) => <NavLink to={`/albums/${row.album_id}`}>{row.title}</NavLink>

    },
    {
      field: 'plays',
      headerName: 'Plays'
    }
  ]

  return (
    <Container>
      {/* {selectedSongId && <SongCard songId={selectedSongId} handleClose={() => setSelectedSongId(null)} />} */}
      {/* <h2>Check out your song of the day:&nbsp;
        <Link onClick={() => setSelectedSongId(songOfTheDay.song_id)}>{songOfTheDay.title}</Link>
      </h2> */}
      <Divider />
      <h2>Top Books</h2>
      
      <LazyTable route={`http://${config.server_host}:${config.server_port}/top_books`} columns={bookColumns} />
      <Divider />

      <Divider />
      <h2>Top Authors</h2>
      
      <LazyTable route={`http://${config.server_host}:${config.server_port}/top_authors`} columns={authorColumns} />
      <Divider />
      {/* TODO (TASK 16): add a h2 heading, LazyTable, and divider for top albums. Set the LazyTable's props for defaultPageSize to 5 and rowsPerPageOptions to [5, 10] */}
      {/* <h2>Top Albums</h2>
      <LazyTable route={`http://${config.server_host}:${config.server_port}/top_Authors`} columns={albumColumns}  defaultPageSize={5} rowsPerPageOptions={[5, 10]}/>
      <Divider /> */}
      {/* TODO (TASK 17): add a paragraph (<p></p>) that displays “Created by [name]” using the name state stored from TASK 13/TASK 14 */}
      {/* <p>Created by {author}</p> */}
    </Container>
  );
};