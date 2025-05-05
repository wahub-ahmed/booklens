import NavBarStart from "../components/NavBarStart";
import bookImage from "../old-books-arranged-on-shelf.avif";
import LoginPage from "./LoginPage";
const { Container } = require("@mui/material")

const StartPage = () => {
    return (
        // Dont have tailwind need to get that installed
        <div className="flex flex-col h-screen items-center align-center">
            <NavBarStart />
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: "20px"}}>
                <img src={bookImage} alt="books"/>
                <LoginPage />
            </div>
        </div>
    )
}

export default StartPage;