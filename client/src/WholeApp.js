import { Routes, Route } from "react-router-dom"
import { Outlet } from "react-router-dom"
import { Container } from "@mui/material"
import NavBar from "./components/NavBar"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"




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

