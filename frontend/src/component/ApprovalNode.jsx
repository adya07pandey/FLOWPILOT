import { Handle, Position } from "reactflow";

export default function ApprovalNode({id,data}) {
  
  const {logic,onTitleChange} = data;
  const statusClass =
      logic.status==="APPROVED" ? "approval-approved" : logic.status==="REJECTED" ? "approval-rejected" :""

  return (
    <>
      <div className={`approval-node ${statusClass}`}>
       
        <input 
          className="nodrag"
          type="text" 
          placeholder="Title..."
          value={logic.title || ""}
          onChange={(e)=>{
            onTitleChange(id,e.target.value)
          }}
        />
        <br />
        {logic.approverName}


        <Handle type="target"  position={Position.Top}/>
        <Handle type="source"  position={Position.Bottom}/>
      </div>
    </>
  )
}



// export default function ApprovalNode({ id, data }) {
//   const { ui, logic } = data;

//   const formatStatus = (status) => {
//   if (!status) return "";
//   return status.charAt(0) + status.slice(1).toLowerCase();
// };

//   const statusClass =
//     logic.status === "APPROVED"
//       ? "approval-approved"
//       : logic.status === "REJECTED"
//       ? "approval-rejected"
//       : "approval-pending";

//   return (
//     <div className={`approval-node ${statusClass}`}>
//       <input
//         className="approval-title-input nodrag"
//         value={ui.label || ""}
//         placeholder="New Approval"
//         onChange={(e) =>
//           data.onTitleChange(id, e.target.value)
//         }
//       />

//       {logic.approver && (
//         <div className="approval-approver">
//           👤 {logic.approver} : {formatStatus(logic.status)}
//         </div>
//       )}

      

//       <Handle type="target" position={Position.Top} />
//       <Handle type="source" position={Position.Bottom} />
//     </div>
//   );
// }