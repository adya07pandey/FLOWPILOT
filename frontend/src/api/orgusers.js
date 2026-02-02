import api from "./axios"

export const getOrgUsers = async () => {
  const res = await api.get("/users/org");
  
  return res.data; 
};


export const inviteUsers = (data) => {
    return api.post("/organizations/invites",data);
}

export const getOrgName = async () => {
  const res = await api.get("/orgname");

  return res;
}
