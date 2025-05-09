import { Routes, Route } from "react-router-dom"
import { Outlet } from "react-router-dom"
import { Container } from "@mui/material"
import NavBar from "./components/NavBar"
import HomePage from "./pages/HomePage"


// The WholeApp is what is meant to be the rest of the app besdies the StartPage/Login area
// Although we ran out of time to actually complete the auth
const WholeApp = () => {
    return (
        <Container>
            <NavBar/>
        {/* This Outlet allows for there to be child  */}
            <Outlet />
        </Container>

    )
}

export default WholeApp;

