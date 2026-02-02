import "../styles/createworkflow.css";
import ApprovalNodeRightPanel from "./ApprovalNodeRightPanel";
import TaskNodeRightPanel from "./TaskNodeRightPanel";

export default function NodeConfigPanel({node,onChange,onDelete}) {

  if(!node) return null;
  const {type,data}=node;
  const {logic} = data;

  


  return (
    <>
     <div className="nodes-info">

      {type==="task" && (<TaskNodeRightPanel logic={logic} onChange={onChange} onDelete={onDelete}/>)}

      {type==="approval" && (<ApprovalNodeRightPanel logic={logic} onChange={onChange} onDelete={onDelete}/>)}

     
     </div>

    
    </>
  )
};