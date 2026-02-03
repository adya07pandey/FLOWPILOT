import { useNavigate } from "react-router-dom";
import { acceptApproval, getTasks, rejectApproval } from "../api/workflow.api.js";
import { useEffect, useState } from "react";
import "../styles/approvals.css"
import { completeApproval, getApprovals } from "../api/task.api.js";
import { IoMdArrowRoundBack } from "react-icons/io";
import InviteUser from "../component/InviteUser.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ApprovalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);

  const [approvals, setApproval] = useState([])
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      const res = await getApprovals();
      setApproval(res.data);
      
    } catch (err) {
      console.error("Failed to get tasks ", err);
    } finally {
      setLoading(false)
    };
  }

  useEffect(() => {
    fetchApprovals();
  }, []);



  const pendingApprovals = approvals.filter((ap) => ap.status === "PENDING");
  const acceptedApprovals = approvals.filter((ap) => ap.status === "ACCEPTED");
  const rejectedApprovals = approvals.filter((ap) => ap.status === "REJECTED");

  const formatDate = (isoString) => {
    if (!isoString) return "No due date";

    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const approveApprovals = async (approvalId) => {
    try {
      await acceptApproval(approvalId);
      // await completeApproval(approvalId);

      fetchApprovals();
    } catch (err) {
      alert("Failed to approve");
    }
  };

  const rejectApprovals = async (approvalId) => {
    try {
      await rejectApproval(approvalId);
      // await completeApproval(approvalId);
      fetchApprovals();
    } catch (err) {
      alert("Failed to reject");
    }
  }



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
          {!loading && approvals.length === 0 && (
            <p style={{ opacity: 0.7 }}>No approvals assigned yet</p>
          )}
          {!loading && pendingApprovals.length !== 0 && (
            <div className="approvals">
              <p>Pending Approvals</p>
              <hr className="divider" />

              <div className="approvals-table">
                <div className="approvals-header">
                  <span className="col-title">Approvals</span>
                  <span className="col-workflow">Workflow</span>
                  <span className="col-action">Action</span>
                </div>

                {pendingApprovals.map((ap) => (
                  <div key={ap.id} className="approval-row">
                    <div className="col-title">
                      <div className="approval-title">
                        {ap.task?.title || "Approval"}
                      </div>
                    </div>

                    <div className="col-workflow">
                      {ap.task?.workflow?.name || "Workflow"}
                    </div>
                    <div className="col-action">
                      <button className="approve-btn" onClick={() => approveApprovals(ap.id)}> Accept</button>
                      <button className="reject-btn" onClick={() => rejectApprovals(ap.id)}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!loading && acceptedApprovals.length !== 0 && (
            <div className="approvals accepted">
              <p>Accepted Approvals</p>
              <hr className="divider" />

              <div className="approvals-table">
                <div className="doneapprovals-header">
                  <span className="col-title">Approval</span>
                  <span className="col-workflow">Workflow</span>
                  <span className="col-date">Decided On</span>
                  <span className="col-status">Status</span>
                </div>

                {acceptedApprovals.map((ap) => (
                  <div key={ap.id} className="approval-row">
                    <div className="col-title">
                      <div className="approval-title">
                        {ap.task?.title || "Approval"}
                      </div>
                    </div>

                    <div className="col-workflow">
                      {ap.task?.workflow?.name || "Workflow"}
                    </div>

                    <div className="col-date">
                      {formatDate(ap.decidedAt)}
                    </div>

                    <div className="col-status">
                      <span className="status-badge accepted">
                        {ap.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!loading && rejectedApprovals.length !== 0 && (
            <div className="approvals rejected">
              <p>Rejected Approvals</p>
              <hr className="divider" />

              <div className="approvals-table">
                <div className="doneapprovals-header">
                  <span className="col-title">Approval</span>
                  <span className="col-workflow">Workflow</span>
                  <span className="col-date">Decided On</span>
                  <span className="col-status">Status</span>
                </div>

                {rejectedApprovals.map((ap) => (
                  <div key={ap.id} className="approval-row">
                    <div className="col-title">
                      <div className="approval-title">
                        {ap.task?.title || "Approval"}
                      </div>
                    </div>

                    <div className="col-workflow">
                      {ap.task?.workflow?.name || "Workflow"}
                    </div>

                    <div className="col-date">
                      {formatDate(ap.decidedAt)}
                    </div>

                    <div className="col-status">
                      <span className="status-badge rejected">
                        {ap.status}
                      </span>
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