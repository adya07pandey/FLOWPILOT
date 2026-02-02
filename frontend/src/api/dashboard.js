import api from "./axios"

export const dashboardStats = async () => {
    const res = await api.get("/dashboard");
    return res.data;
};

