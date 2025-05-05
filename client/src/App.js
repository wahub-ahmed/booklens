import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";
import HomePage from "./pages/HomePage";
import BooksPage from "./pages/BooksPage";
import AlbumsPage from "./pages/AlbumsPage";
import LoginPage from "./pages/LoginPage";
import NavBar from './components/NavBar';
import StartPage from "./pages/StartPage";
import WholeApp from "./WholeApp";

// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: amber,
  },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<StartPage/>}/> */}
          <Route path="/loggedin" element={<WholeApp/>}>
            <Route path="home" element={<HomePage/>} />
            <Route path="books" element={<BooksPage/>} /> 
            <Route path="authors" element={<AlbumsPage/>} />         
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}