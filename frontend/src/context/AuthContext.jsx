import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        setLoading(true); 

        try {
            const res = await api.get("/auth/me");
            setUser(res.data.user);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };




    useEffect(() => {
        fetchUser();
    }, []);

    const logout = async () => {
        await api.post("/auth/logout");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);