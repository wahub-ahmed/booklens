import { useParams, NavLink } from "react-router-dom"
import { useEffect, useState} from "react";
import LazyTable from "../components/LazyTable";
const config = require('../config.json');

//Displays information about a given book
const BookInfoPage = () => {
    const {bookId} = useParams();
    const [bookData, setBookData] = useState({});

    /**
     * Fetch data about a book using given bookId
     */
    useEffect( ()=>{
        const getData = async () =>{
        try{
            const data = await fetch(`http://${config.server_host}:${config.server_port}/books/${bookId}`)
            const dataJson = await data.json();
            setBookData(dataJson)
        }catch(err){
            console.log(err)
        }
    }
    getData();
})

const reviewColumns = [
    {
      field: 'reviewer_name',
      headerName: 'Reviewer',
    //   renderCell: (row) => <NavLink to={`/albums/${row.album_id}`}>{row.title}</NavLink>

    },
    {
        field: 'reviewscore',
        headerName: 'Review Score'
    },
    {
      field: 'reviewtext',
      headerName: 'Review'
    }
  ]
    return (
        <div style={{display: "flex", alignItems: 'center', flexDirection: "column"}}>
            <h2>{bookData ? bookData.title : ""}</h2>
            <h2>By: {bookData.author_name}</h2>
            <img src={bookData.image}/>
            
            <div style={{alignItems: 'flex-start'}}>
                <h2>About</h2>
                <h3>Publisher: </h3>
                <p>{bookData.publisher}</p>
                <h3>Synopsis: </h3>
                <p>{bookData.description}</p>

            </div>
            <div>
                <h2>Reviews</h2>
                <LazyTable route={`http://${config.server_host}:${config.server_port}/books/${bookId}/reviews`} columns={reviewColumns} />
            </div>
        </div>
       
    )
}

export default BookInfoPage;