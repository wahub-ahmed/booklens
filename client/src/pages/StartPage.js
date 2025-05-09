import NavBarStart from "../components/NavBarStart";
import bookImage from "../old-books-arranged-on-shelf.avif";
const { Container, Button } = require("@mui/material")

// Where the user is first brought, navigates to HomePage
const StartPage = () => {
    return (
        <div className="flex flex-col h-screen items-center align-center">
            <NavBarStart />
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: "20px"}}>
                <img src={bookImage} alt="books"/>
            </div>
        </div>
    )
}

export default StartPage;