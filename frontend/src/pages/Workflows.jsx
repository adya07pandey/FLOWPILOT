import { useEffect, useState } from "react";
import "reactflow/dist/style.css"
import { v4 as uuid } from "uuid";
import "../styles/workflow.css"
import { useNavigate } from "react-router-dom";
import { getWorkflows, startWorkflow } from "../api/workflow.api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { IoMdArrowRoundBack } from "react-icons/io";
import InviteUser from "../component/InviteUser.jsx";

export default function WorkflowPage() {
  const navigate = useNavigate();
  const {user} = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });

  const fetchWorkflows = async () => {
    try {
      const res = await getWorkflows();
      setWorkflows(res.data);
      
    } catch (err) {
      console.error("Failed to load Workflows", err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchWorkflows();
  }, []);
  const safeWorkflows = Array.isArray(workflows) ? workflows : [];
  const activeWorkflows = safeWorkflows.filter((w) => w.status === "ACTIVE");
  const draftWorkflows = safeWorkflows.filter((w) => w.status === "DRAFT");
  const completedWorkflows = safeWorkflows.filter((w) => w.status === "COMPLETED" || w.status === "REJECTED");
 
  

  const handleStartWorkflow = async (workflowId) => {
    try {
      await startWorkflow(workflowId);
      await fetchWorkflows();
      showNotification("Workflow started successfully", "success");


    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to start workflow",
        "error"
      );

    }
  }

  const openWorkflow = (wf) => {
    const isCreator = wf.creator?.id === user.userId;
   
    navigate(`/createworkflow/${wf.id}`, {
      state: {
        mode: isCreator ? "edit" : "view"
      }
    });
  };

  const showNotification = (message, type = "success", timeout = 2500) => {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, timeout);
  };

  return (
    <>
      <div className="navbar">
        <div className="left-nav">
          <button className="back-square" onClick={() => { navigate("../dashboard") }}><IoMdArrowRoundBack /></button>
          <div className="logo"><img src="/logo.png" alt="Logo" /></div>
        </div>
      </div>
      {notification.message && (
        <div className={`toast ${notification.type}`}>
          {notification.message}
        </div>
      )}

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
          {!loading && safeWorkflows.length === 0 && (
            <p style={{ opacity: 0.7 }}>No Workflows assigned yet</p>
          )}
          {/* <div className="workflow-card">
            <div className="wf-name">
              name
            </div>
            <div className="card-divider"></div>
            <div className="wf-createdby">By - name</div>
            <div className="wf-created-at">At - date</div>
            <div className="start-wf">Start Workflow</div>

          </div> */}


          {!loading && draftWorkflows.length !== 0 && (

            <div className="draft-workflows">
              <p>Drafts</p>
              <hr className="divider" />
              <div className="draft-workflows-list">

                {
                  draftWorkflows.map((wf) => (
                    <div key={wf.id} className="workflow-card" onClick={() => { openWorkflow(wf) }}>
                      <div className="wf-name">
                        {wf.name?.trim() ? wf.name : "Workflow"}
                      </div>
                      <div className="divider"></div>
                      <div className="wf-createdby">By - {wf.creator?.name || "Unknown"}</div>
                      <div className="wf-created-at">At - {new Date(wf.createdAt).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })} </div>
                      {wf.status === "DRAFT" && (<button className="start-wf" onClick={(e) => { e.stopPropagation(); handleStartWorkflow(wf.id); }}>Start Workflow</button>)}
                    </div>

                  ))
                }
              </div>
            </div>
          )
          }

          {!loading && activeWorkflows.length !== 0 && (

            <div className="active-workflows">
              <p>Active Workflows</p>
              <hr className="divider" />
              <div className="active-workflows-list">

                {
                  activeWorkflows.map((wf) => (
                    <div key={wf.id} className="workflow-card" onClick={() => { openWorkflow(wf) }}>
                      <div className="wf-name">
                        {wf.name?.trim() ? wf.name : "Workflow"}
                      </div>
                      <div className="divider"></div>
                      <div className="wf-createdby">By - {wf.creator?.name || "Unknown"}</div>
                      <div className="wf-created-at">At - {new Date(wf.createdAt).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })} </div>
                      {/* <div className="start-wf">Start Workflow</div> */}
                    </div>

                  ))
                }
              </div>
            </div>
          )}

          {!loading && completedWorkflows.length !== 0 && (

            <div className="completed-workflows">
              <p>Completed Workflows</p>
              <hr className="divider" />
              <div className="completed-workflows-list">
                {
                  completedWorkflows.map((wf) => (
                    <div key={wf.id} className={`workflow-card ${wf.status === "REJECTED" ? "workflow-rejected" : ""}`} onClick={() => { openWorkflow(wf) }}>
                      <div className="wf-name">
                        {wf.name?.trim() ? wf.name : "Workflow"}
                      </div>
                      <div className="divider"></div>
                      <div className="wf-createdby">By - {wf.creator?.name || "Unknown"}</div>
                      <div className="wf-created-at">At - {new Date(wf.createdAt).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })} </div>
                      {/* <div className="start-wf">Start Workflow</div> */}
                    </div>

                  ))
                }
              </div>
            </div>
          )}



        </div>
      </div>
    </>
  )

}