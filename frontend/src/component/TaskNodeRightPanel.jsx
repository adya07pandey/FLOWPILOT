import { useState, useEffect } from "react";
import { getOrgUsers } from "../api/orgusers";

export default function TaskNodeRightPanel({ logic, onChange, onDelete }) {

  const [orgUsers, setOrgUsers] = useState([]);
  const [assigneeName, setAssigneeName] = useState("");
  const [assigneeError, setAssigneeError] = useState("");

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




  const validateAssignee = (name) => {
    if (!Array.isArray(orgUsers)) return;
    const user = orgUsers.find(
      (u) => u.name.trim().toLowerCase() === name.trim().toLowerCase()
    );

    if (!user) {
      setAssigneeError("This user isn’t part of the organization");


      onChange({
        ...logic,
        assignedTo: null,
      });

      return false;
    }

    setAssigneeError("");

    onChange({
      ...logic,
      assignedTo: user.id,
      assignedToName: user.name,
    });

    return true;
  };

 
  
  useEffect(() => {
    if (logic.assignedToName) {
      setAssigneeName(logic.assignedToName);
    }
  }, [logic.assignedToName]);


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
      <label>Assigned To</label>
      <input
        value={assigneeName}
        onChange={(e) => {
          const value = e.target.value;
          setAssigneeName(value);
          setAssigneeError("");

          onChange({
            ...logic,
            assignedToName: value,
            assignedTo: null,
          });
        }}
        onBlur={(e) => validateAssignee(e.target.value)}
        placeholder="Assign to"
      />

      {assigneeError && (
        <div className="field-warning">
          <span className="warning-icon">⚠</span>
          <span className="warning-text">{assigneeError}</span>
        </div>
      )}


      <label >Due Data</label>
      <input type="date"
        value={logic.dueDate || ""}
        onChange={(e) =>
          onChange({
            ...logic,
            dueDate: e.target.value
          })}
      />
      <button className="deletenodebtn" onClick={onDelete}> Delete Node</button>


    </>
  )
}