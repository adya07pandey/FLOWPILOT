import { Handle, Position } from "reactflow";

export default function TaskNode({id,data}) {

  const {logic,onTitleChange} = data;

  const statusClass =
      logic.status==="IN_PROGRESS" ? "task-inprogress" : logic.status==="DONE" ? "task-done" :""

  return (
    <>
      <div className={`task-node ${statusClass}`}>
       
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
        {logic.assignedToName}
  




        <Handle type="target"  position={Position.Top}/>
        <Handle type="source"  position={Position.Bottom}/>



      </div>




    </>
  )
}