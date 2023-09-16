import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from "@mui/material/Typography";
import MyAppBar from "../components/MyAppBar";

import {useState} from "react";
import dataModel from '../lib/dataModel';
import {Container, Snackbar, Alert} from "@mui/material";
import {useNavigate, useSearchParams} from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [errMsg, setErrMsg] = useState('')
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const handleSubmit = event => {
        event.preventDefault();
        setLoading(true);
        setShowAlert(false);
        dataModel.login(username, password)
            .then(() => {
                let to = '/';
                const cb = searchParams.get('cb');
                if (cb) {
                    to = cb;
                }
                navigate(to);
            })
            .catch(error => {
                let e = error.toString()
                if (error.response) {
                    if (error.response.status === 401) {
                        e = "Incorrect username or password";
                    }
                }
                setShowAlert(true);
                setErrMsg(e);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleCloseSnackbar = () => {
        setShowAlert(false);
    }

    return (
        <>
            <MyAppBar drawerOpen={false}>
                <Typography variant="h6" noWrap component="div">
                    ContainerUp
                </Typography>
            </MyAppBar>

            <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error">
                    {errMsg}
                </Alert>
            </Snackbar>

            <Container maxWidth="xs" sx={{marginTop: '96px'}}>
                <form onSubmit={handleSubmit}>
                    <h2>
                        Login
                    </h2>
                    <TextField
                        label="Username"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        fullWidth
                        size="small"
                        margin="normal"
                        autoFocus
                    />
                    <TextField
                        label="Password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                        fullWidth
                        size="small"
                        margin="normal"
                    />
                    <LoadingButton
                        type="submit"
                        variant="outlined"
                        loading={loading}
                        sx={{marginTop: '16px'}}
                    >
                        <span>Submit</span>
                    </LoadingButton>
                </form>
            </Container>

        </>
    )
}