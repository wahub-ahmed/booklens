const { Container, TextField, Button } = require("@mui/material")

const LoginPage = () => {

    const [userName, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', 
            body: JSON.stringify({
            username: userName,
            password: password
      })
        }


        )
    }

    return (
        <Container>
            <h1>Login</h1>
            <form style={{ display: 'flex', flexDirection: 'column'}} onSubmit={handleSubmit}>
                <TextField id="userName" label="Username" variant="outlined"/>
                <TextField id="password" label="Password" variant="outlined"/>
                <Button variant="outlined" type='submit'>Login</Button>
            </form>

        </Container>
    )
}

export default LoginPage;