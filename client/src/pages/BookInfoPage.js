import { useParams } from "react-router-dom"
import { useEffect, useState } from "react";


const config = require('../config.json');
const BookInfoPage = () => {
    const {bookId} = useParams();
    const [bookData, setBookData] = useState({});

    useEffect( ()=>{
        const getData = async ()=>{
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

    return (
        <div>
            <h1>Book Title: {bookData ? bookData.title : ""}</h1>
            <img src={bookData.image}/>

            <div>
                <h2>Reviews</h2>
            </div>
        </div>
       
    )
}

export default BookInfoPage;