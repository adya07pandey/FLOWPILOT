import api from "./axios"

export const signup = async(data) => {
    return api.post("/auth/signup",data);    
}

export const login = async(data) => {
    return api.post("/auth/login",data);
}

export const logout = async(data) => {
    return api.post("/auth/logout",data);
}

export const getMe = async () => {
    return api.get("/auth/me");
}