import "../styles/createworkflow.css"
import "reactflow/dist/style.css";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom"
import { v4 as uuid } from "uuid";
import { ReactFlow, Background, Controls, useEdgesState, useNodesState, addEdge, Position } from "reactflow";
import ApprovalNode from "../component/ApprovalNode";
import TaskNode from "../component/TaskNode";
import { useCallback, useState, useEffect } from "react";
import NodeConfigPanel from "../component/NodeConfigPanel";
import { createWorkflow } from "../api/workflow.api";
import { useParams, useLocation } from "react-router-dom";
import { getWorkflowById } from "../api/workflow.api";
import { useAuth } from "../context/AuthContext";
import InviteUser from "../component/InviteUser";

const nodeTypes = {
  task: TaskNode,
  approval: ApprovalNode
}


export default function CreateWorkflow() {

  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  const [error, setError] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const [workflowName, setWorkflowName] = useState("");

  const { id } = useParams();
  const location = useLocation();
  const mode = location.state?.mode || "edit";
  const isViewOnly = mode === "view";
  const [inviteOpen, setInviteOpen] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saving, setSaving] = useState(false);



  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);


  const addNodes = (type) => {
    const data =
      type === "task"
        ? {
          ui: { label: "Task" },
          logic: {
            title: "",
            assignedToName: "",
            assignedTo: null,
            status: "",
            dueDate: "",
          },
        }
        : {
          ui: { label: "Approval" },
          logic: {
            title: "",
            approverName: "",
            approver: null,
            status: "",
          },
        };

    const newNode = {
      id: uuid(),
      type,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: {
        ...data,
        onTitleChange: (id, value) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === id
                ? {
                  ...n,
                  data: {
                    ...n.data,
                    logic: {
                      ...n.data.logic,
                      title: value,
                    },
                  },
                }
                : n
            )
          );
        },
      },
    };

    setNodes((n) => [...n, newNode]);
    setSelectedNodeId(newNode.id);
  };
  const updateSelectedNodeLogic = (newLogic) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? {
            ...n,
            data: {
              ...n.data,
              logic: newLogic,
            },
          }
          : n
      )
    )
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) return;

    const nodeId = selectedNode.id;

    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));

    setSelectedNodeId(null);
  };


  const saveWorkflow = async () => {
    setSaveError("");
    setSaveSuccess("");

    if (!workflowName || workflowName.trim() === "") {
      showSaveError("Workflow name is required");
      return;
    }

    for (const node of nodes) {
      if (node.type === "task") {
        const { title, assignedTo } = node.data.logic;

        if (!title || title.trim() === "") {
          showSaveError("Every task must have a title");
          return;
        }

        if (!assignedTo) {
          showSaveError("Every task must have an assignee");
          return;
        }
      }

      if (node.type === "approval") {
        const { title, approver } = node.data.logic;

        if (!title || title.trim() === "") {
          showSaveError("Every approval must have a title");
          return;
        }

        if (!approver) {
          showSaveError("Every approval must have an approver");
          return;
        }
      }
    }

    const payload = {
      name: workflowName,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        config: n.data.logic,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        fromNodeId: e.source,
        toNodeId: e.target,
        condition: e.data || null,
      })),
    };

    try {
      setSaving(true);
      await createWorkflow(payload);

      setSaveSuccess("Workflow saved successfully");

      setTimeout(() => {
        setSaveSuccess("");
      }, 1500);
    } catch (err) {
      showSaveError(
        err.response?.data?.message || "Could not save workflow"
      );
    }
    finally {
      setSaving(false);
    }
  };

  const showSaveError = (message, timeout = 2500) => {
    setSaveError(message);

    setTimeout(() => {
      setSaveError("");
    }, timeout);
  };



  useEffect(() => {
    if (!id) return;

    const fetchWorkflow = async () => {
      const res = await getWorkflowById(id);
      setWorkflowName(res.data.name);

      setNodes(
        res.data.nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: {
            logic: n.config,
          },
        }))
      )
      setEdges(
        res.data.edges.map((e) => ({
          id: e.id,
          source: e.fromNodeId,
          target: e.toNodeId,
        }))
      )

    }
    fetchWorkflow();
  }, [id]);

  return (
    <>
      <div className="navbar">
        <div className="left-nav">
          <button className="back-square" onClick={() => { navigate("../dashboard") }}><IoMdArrowRoundBack /></button>
          <div className="logo"><img src="/logo.png" alt="Logo" /></div>
        </div>
        <div className="right-nav">
          <div className={`status ${isViewOnly ? "view" : "edit"}`}>
            {isViewOnly ? "View Only" : "Editable"}
          </div>

          <button className="save" disabled={isViewOnly || saving} onClick={() => { saveWorkflow() }}>{saving ? "Saving..." : "Save"}</button>
        </div>

      </div>
      <div className="main1">
        <div className="leftsidebar">
          <div className="a">
            <div className="workflowname">{workflowName}</div>
            <button className="add-node" disabled={isViewOnly} onClick={() => { addNodes("task") }}>+ Task</button>
            <button className="add-node" disabled={isViewOnly} onClick={() => { addNodes("approval") }}>+ Approval</button>
          </div>
          <div className="b">

            {user?.role !== "USER" && <InviteUser setInviteOpen={setInviteOpen} />}
          </div>
        </div>
        <div className="rightside" style={{ pointerEvents: inviteOpen ? "none" : "auto" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={isViewOnly ? undefined : onNodesChange}
            onEdgesChange={isViewOnly ? undefined : onEdgesChange}
            onConnect={isViewOnly ? undefined : onConnect}
            nodesDraggable={!isViewOnly}
            nodesConnectable={!isViewOnly}
            elementsSelectable={!isViewOnly}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        {saveError && (
          <div className="save-banner error">
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className="save-banner success">
            {saveSuccess}
          </div>
        )}
        <div className="rightpanel">
          <div className="workflow-name">
            <input type="text" placeholder="Workflow Name" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} />
          </div>
          {selectedNode && (<NodeConfigPanel node={selectedNode} onChange={updateSelectedNodeLogic} onDelete={deleteSelectedNode} />)}


        </div>


      </div>
    </>
  );
}