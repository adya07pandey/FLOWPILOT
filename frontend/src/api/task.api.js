import api from "./axios"

export const getTasks = () => {
    return api.get("/tasks");
};

export const completeTask = (id) => {
    return api.post(`/tasks/${id}/complete`);
};

export const completeApproval = (id) => {
    return api.post(`/approvals/${id}/complete`);
};


export const getApprovals = () => {
    
    return api.get("/approvals");
   
}
