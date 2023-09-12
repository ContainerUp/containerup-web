import {useNavigate} from "react-router-dom";
import dataModel from "../lib/dataModel";
import {useEffect} from "react";

export default function Logout() {
    const navigate = useNavigate();

    dataModel.logout().catch(() => {});

    useEffect(() => {
        navigate('/');
    }, [navigate]);

    return (
        <>
            Logout
        </>
    );
}