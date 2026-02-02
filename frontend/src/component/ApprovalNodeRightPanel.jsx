import { useState, useEffect } from "react";
import { getOrgUsers } from "../api/orgusers";


export default function ApprovalNodeRightPanel({ logic, onChange, onDelete }) {
  const [orgUsers, setOrgUsers] = useState([]);
  const [approverName, setApproverName] = useState("");
  const [approverError, setApproverError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getOrgUsers();
        setOrgUsers(res);
      } catch (err) {
        console.error("Failed to fetch org users", err.response?.data || err);
      }
    };

    fetchUsers();
  }, []);


  const validateApprover = (name) => {
    if (!Array.isArray(orgUsers)) return;
    const user = orgUsers.find(
      (u) => u.name.trim().toLowerCase() === name.trim().toLowerCase()
      
    );

    if (!user) {
      setApproverError("User not found in organization");

      onChange({
        ...logic,
        approver: null,
      });

      return false;
    }

    setApproverError("");

    onChange({
      ...logic,
      approver: user.id,
      approverName: user.name,
    });

    return true;
  };

  useEffect(() => {
    if (logic.approverName) {
      setApproverName(logic.approverName);
    }
  }, [logic.approverName]);


  return (

    <>



      <label>Title</label>
      <input type="text" placeholder="Title..."
        value={logic.title || ""}
        onChange={(e) =>
          onChange({
            ...logic,
            title: e.target.value
          })}

      />
      <label >Approver</label>
      <input
        value={approverName}
        onChange={(e) => {
          const value = e.target.value;
          setApproverName(value);
          setApproverError("");

          onChange({
            ...logic,
            approverName: value,
            approver:null,            
          })
        }}
        onBlur={(e)=>validateApprover(e.target.value)}
        placeholder="Approver"
      />

      {approverError && ( <p style={{color:"Red"}}>{approverError}</p>)}
      

      <button className="deletenodebtn" onClick={onDelete}> Delete Node</button>


    </>
  )
}