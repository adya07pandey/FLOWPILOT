import { useEffect, useState } from "react";
import "../styles/dashboard.css"
import { useNavigate } from "react-router-dom"
import { getOrgName, inviteUsers } from "../api/orgusers.js";
import InviteUser from "../component/InviteUser.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { dashboardStats } from "../api/dashboard.js";
import { WorkflowPieChart } from "../component/WorkflowPieChart.jsx";


export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orgname,setOrgname] = useState("");
  const { totalTasks = 0, completedToday = 0, avgCompletionTime = 0, pendingApprovals = 0, activeWorkflows = 0,
    taskStatusStats = [], bottleneckSteps = [], workflowPerformance = [], userWorkload = [],
    runningWorkflows = [], overdueTasks = [], workflowStats = [], newTasksToday = 0, completedTasksByDay = [] } = stats || {};

  const statsCards = [
    {
      label: "Total Tasks",
      value: totalTasks,
    },
    {
      label: "Completed Today",
      value: completedToday,
    },
    {
      label: "Avg Completion Time",
      value: `${avgCompletionTime} hrs`,
    },
    {
      label: "Active Workflows",
      value: activeWorkflows,
    },


  ];

  const getStats = async () => {
    try {
      const res = await dashboardStats();
      const w=await getOrgName();
      setOrgname(w.data.orgName);

      setStats(res);
    } catch (err) {

      alert("Stats error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  const maxCount =
    completedTasksByDay && completedTasksByDay.length > 0
      ? Math.max(...completedTasksByDay.map(d => d.count), 1)
      : 1;
const todayKey = new Date().toISOString().slice(0, 10);
  return (
    <>
      <div className="navbar">
        <div className="logo" onClick={() => { navigate("../") }}><img src="/logo.png" alt="Logo" /></div>
        <div className="orgname">{orgname}</div>
      </div>
      <div className="main">
        <div className="leftsidebar1">
          <div className="a">

            <button className="create-workflow" onClick={() => { navigate("../createworkflow") }}>Create Workflow</button>
            <button className="leftsidebar-list" onClick={() => { navigate("../dashboard") }}> Dashboard</button>
            <button className="leftsidebar-list" onClick={() => { navigate("../workflow") }}> Workflows</button>
            <button className="leftsidebar-list" onClick={() => { navigate("../tasks") }}>Tasks</button>
            <button className="leftsidebar-list" onClick={() => { navigate("../approvals") }}>Approvals</button>
          </div>
          {user?.role !== "USER" && <InviteUser setInviteOpen={setInviteOpen} />}

        </div>
        <div className="rightsidebar-dashboard">
          <div className="a1">
            {loading ? (
              <p>Loading stats...</p>
            ) : (
              statsCards.map((card, index) => (
                <div className="a2" key={index}>
                  <p>{card.label}</p>
                  <div className="card-divider" />
                  <h1>{card.value}</h1>
                </div>
              ))
            )}
          </div>
          <div className="b1">
            <div className="b2">
              <div className="b3 task-completed">
                <p>Tasks Completed</p>

                {!loading && completedTasksByDay?.length > 0 ? (
                  <div className="bar-chart">
                    {completedTasksByDay.map((d) => {
                      const heightPercent = (d.count / maxCount) * 100;

                      return (
                        <div key={d.date} className="bar-wrapper">
                          <div
                            className={`bar ${d.date === todayKey ? "today" : ""}`}
                            style={{ height: `${heightPercent}%` }}
                            data-tooltip={`${d.count} tasks`}
                          />
                          <span className="bar-label">
                            {new Date(d.date).toLocaleDateString(undefined, {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="none-text">No data</div>
                )}
              </div>


              <div className="b3">
                <p>Running Workflows</p>
                {!loading && runningWorkflows.length > 0 && (


                  <div className="running-workflow-list list">
                    {runningWorkflows.map((wf) => (
                      <div key={wf.id} className="workflow-progress-row">
                        <div className="workflow-header">
                          <span className="workflow-name">{wf.name}</span>
                          <span className="workflow-percent">{wf.progress}%</span>
                        </div>

                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${wf.progress}%` }}
                          />
                        </div>

                        <div className="workflow-meta">
                          {wf.completedTasks}/{wf.totalTasks} tasks completed
                        </div>
                      </div>
                    ))}
                  </div>

                )}

              </div>
              <div className="b3">
                <p>Team Workload</p>
                {!loading && userWorkload.length > 0 ? (
                  <>


                    <div className="user-workload-list list">
                      {userWorkload.map((u) => {
                        const percent =
                          u.totalTasks > 0
                            ? Math.round((u.completedTasks / u.totalTasks) * 100)
                            : 0;

                        return (
                          <div key={u.userId} className="user-workload-row">
                            <div className="user-row-top">
                              <span className="user-name">{u.userName}</span>
                              <span className="user-metrics">
                                {u.completedTasks}/{u.totalTasks} Tasks
                              </span>
                            </div>

                            <div className="progress-bar sm">
                              <div
                                className="progress-fill"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="none-text">None</div>
                )}
              </div>

              <div className="b3">
                <p>Overdue Tasks</p>
                {!loading ? (
                  <>


                    {overdueTasks.length > 0 ? (
                      <div className="overdue-task-list list">
                        {overdueTasks.map((t) => (
                          <div key={t.taskId} className="overdue-task-row">
                            <div className="overdue-row-top">
                              <span className="overdue-task-title"> {t.title || "Untitled Task"} </span>
                              <span className="overdue-hours"> {t.overdueByHours}h </span>
                            </div>

                            <div className="overdue-row-bottom">
                              <span className="overdue-user">{t.assignedTo}</span>
                              <span className="overdue-workflow">{t.workflowName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="none-text">No overdue tasks</div>
                    )}
                  </>
                ) : null}
              </div>

            </div>
            <div className="b4">
              <div className="b5">
                <div className="b6">
                  <p>Workflow Overview</p>
                  {!loading && workflowStats && (
                    <>
                      <WorkflowPieChart stats={workflowStats} />
                    </>
                  )}

                </div>
                <div className="b6">
                  <p>Workflow Performance</p>
                  {!loading && workflowPerformance.length > 0 ? (
                    <>


                      <div className="workflow-performance-list list">
                        {workflowPerformance.map((wf, index) => (
                          <div key={index} className="workflow-performance-row">
                            <div className="wf-row-top">
                              <span className="wf-name">
                                {wf.workflowName || "Unnamed Workflow"}
                              </span>
                              <span className="wf-runs">{wf.runs} runs</span>
                            </div>

                            <div className="wf-row-bottom">
                              <div className="progress-bar sm">
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${Math.min(wf.runs * 10, 100)}%`,
                                  }}
                                />
                              </div>

                              <span className="wf-avg">
                                {wf.avgTimeHours} hrs avg
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="none-text">None</div>
                  )}
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </>
  );
}
