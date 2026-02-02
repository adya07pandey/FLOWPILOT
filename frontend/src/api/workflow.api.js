import api from "./axios";
export const createWorkflow = (data) => {
    return api.post("/workflow",data);
}

export const getWorkflows = () => {
    
    return api.get("/workflow");
}

export const getWorkflowById = (workflowId) => {
    return api.get(`/workflow/${workflowId}`);
}

export const startWorkflow = (workflowId,body = {}) => {
    return api.post(`/workflow/${workflowId}/start`,body);
};



export const getTasks = () => {
    return api.get("/tasks");
}

export const startTask = (taskId,body = {}) => {
    return api.post(`/tasks/${taskId}/start`,body);
};

export const completeTask = (taskId,body = {}) => {
    return appi.post(`/tasks/${taskId}/complete`,body);
};

// export const blockTask = (taskId,body={}) => {
//     return api.post(`/tasks/${taskId}/block`,body);
// };

export const acceptApproval = (approvalId) => {
    return api.post(`/approvals/${approvalId}/accept`);
};

export const rejectApproval = (approvalId) => {
    return api.post(`/approvals/${approvalId}/reject`);
};

