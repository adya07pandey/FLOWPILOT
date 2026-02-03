import { useNavigate } from "react-router-dom";
import { getTasks } from "../api/workflow.api.js";
import { useEffect, useState } from "react";
import "../styles/tasks.css"
import { IoMdArrowRoundBack } from "react-icons/io";
import { useAuth } from "../context/AuthContext.jsx";
import InviteUser from "../component/InviteUser.jsx";
import { completeTask } from "../api/task.api.js";

export default function TasksPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  const user = useAuth();
  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
      
    } catch (err) {
      
    } finally {
      setLoading(false)
    };
  }

  useEffect(() => {
    fetchTasks();
  }, []);



  const inprogressTasks = tasks.filter((tk) => tk.status === "PENDING");
  const completedTasks = tasks.filter((tk) => tk.status === "DONE");
 
  
  const formatDate = (isoString) => {
    if (!isoString) return "No due date";

    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const markTaskComplete = async (taskId) => {
    try {
      setCompletingId(taskId);
      await completeTask(taskId);
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete task");
    } finally {
      setCompletingId(null);
    }
  };





  return (
    <>
      <div className="navbar">
        <div className="left-nav">
          <button className="back-square" onClick={() => { navigate("../dashboard") }}><IoMdArrowRoundBack /></button>
          <div className="logo"><img src="/logo.png" alt="Logo" /></div>
        </div>
      </div>
      <div className="main">
        <div className="leftsidebar">
          <div className="a">
            <button className="create-workflow" onClick={() => { navigate("../createworkflow") }}> Create Workflow</button>
            <button className="leftsidebar-list" onClick={() => { navigate("../dashboard") }}> Dashboard</button>
            <button className="leftsidebar-list" onClick={() => { navigate("../workflow") }}> Workflows</button>
            <button className="leftsidebar-list" onClick={() => { navigate("../tasks") }}>Tasks</button>
            <button className="leftsidebar-list" onClick={() => { navigate("../approvals") }}>Approvals</button>

          </div>
          {user?.role !== "USER" && <InviteUser setInviteOpen={setInviteOpen} />}

        </div>
        <div className="rightsidebar">
          {loading && <p>Loading...</p>}
          {!loading && tasks.length === 0 && (
            <p style={{ opacity: 0.7 }}>No tasks assigned yet</p>
          )}


          {!loading && inprogressTasks.length !== 0 && (
            <div className="inprogress-tasks">
              <p>Assigned Tasks</p>
              <hr className="divider" />

              <div className="tasks-table">
                <div className="tasks-header">
                  <span className="col-title">Task</span>
                  <span className="col-workflow">Workflow</span>
                  <span className="col-date">Due</span>
                  <span className="col-action"></span>
                </div>

                {inprogressTasks.map((tk) => (
                  <div key={tk.id} className="task-row">
                    <div className="col-title">
                      <div className="task-title">{tk.title}</div>
                    </div>

                    <div className="col-workflow">
                      {tk.workflow?.name || "Workflow"}
                    </div>

                    <div className="col-date">
                      {formatDate(tk.dueDate)}
                    </div>

                    <div className="col-action">
                      {tk.status !== "COMPLETED" && (
                        <button
                          className="complete-btn"
                          onClick={() => markTaskComplete(tk.id)}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}



          {!loading && completedTasks.length !== 0 && (
            <div className="completed-tasks">
              <p>Completed Tasks</p>
              <hr className="divider" />

              <div className="tasks-table">
                <div className="tasks-header">
                  <span className="col-title">Task</span>
                  <span className="col-workflow">Workflow</span>
                  <span className="col-date">Completed On</span>
                  <span className="col-action"></span>
                </div>

                {completedTasks.map((tk) => (
                  <div key={tk.id} className="task-row completed">
                    <div className="col-title">
                      <div className="task-title completed-title">
                        {tk.title}
                      </div>
                    </div>

                    <div className="col-workflow">
                      {tk.workflow?.name || "Workflow"}
                    </div>

                    <div className="col-date">
                      {formatDate(tk.completedOn || "")}
                    </div>

                    <div className="col-action">
                      <span className="done-check">✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>
      </div>
    </>
  )






}