import { prisma } from "../../config/db.js";
import { logTaskEvent, logWorkflowEvent } from "../logs/log.helper.js";

export const startWorkflow = async ({ workflowId, orgId }) => {
  return prisma.$transaction(async (tx) => {
    const workflow = await tx.workflow.findFirst({
      where: { id: workflowId, organizationId: orgId },
      include: { nodes: true, edges: true }
    });

    if (!workflow) throw new Error("Workflow not found");
    if (workflow.status !== "DRAFT")
      throw new Error("Workflow already started");

    const incoming = new Set(workflow.edges.map(e => e.toNodeId));
    const rootNodes = workflow.nodes.filter(
      node => !incoming.has(node.id)
    );

    if (rootNodes.length === 0)
      throw new Error("No start node found");

    const tasks = [];

    for (const node of rootNodes) {
      const nodeType = node.type.toUpperCase();
      const status = nodeType === "PENDING";

      const task = await tx.task.create({
        data: {
          organizationId: orgId,
          workflowId: workflow.id,
          nodeId: node.id,
          status: "PENDING",
          title: node.config.title ?? null,
          assignedTo: node.config.assignedTo ?? null,
          dueDate: node.config.dueDate
            ? new Date(node.config.dueDate)
            : null,
        }
      });

      await logTaskEvent({
        tx,
        taskId: task.id,
        action: "TASK_CREATED",
      });

      await logWorkflowEvent({
        tx,
        workflowId: workflow.id,
        action: "TASK_CREATED",
      });


      if (nodeType === "APPROVAL") {
        if (!node.config.approver)
          throw new Error("Approval node missing approver");

        await tx.approval.create({
          data: {
            taskId: task.id,
            approverId: node.config.approver,
            status: "PENDING"
          }
        });
      }

      tasks.push(task);
    }

    await tx.workflow.update({
      where: { id: workflow.id },
      data: { status: "ACTIVE" }
    });

    return { message: "Workflow started", tasks };
  });
};

export const getTasks = async ({ userId, orgId }) => {

  return prisma.task.findMany({
    where: { assignedTo: userId, organizationId: orgId },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      workflow: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  })
}

export const getApprovals = async ({ userId, orgId }) => {
  return prisma.approval.findMany({
    where: {
      approverId: userId,
      task: {
        organizationId: orgId,
      },
    },
    orderBy: {
      decidedAt: "desc",
    },
    include: {
      task: {
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

export const completeTask = async ({ taskId }) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
      include: {
        workflow: {
          include: {
            nodes: true,
            edges: true,
          }
        }
      }
    })

    if (!task) {
      throw new Error("Task Not Found");
    }

    if (task.status === "DONE") {
      throw new Error("Task already completed");
    }

    await tx.task.update({
      where: { id: taskId },
      data: {
        status: "DONE",
        completedOn: new Date(),
      }
    });


    await logTaskEvent({
      tx,
      taskId,
      action: "TASK_COMPLETED",
      performedBy: task.assignedTo,
    });

    await logWorkflowEvent({
      tx,
      workflowId: task.workflowId,
      action: "TASK_APPROVED",
      performedBy: task.assignedTo,
    });




    const { workflow } = task;

    const outgoingEdges = workflow.edges.filter(
      (e) => e.fromNodeId === task.nodeId
    )

    for (const edge of outgoingEdges) {

      const nextNode = workflow.nodes.find(
        (n) => n.id === edge.toNodeId
      )

      if (!nextNode) continue;

      // check if incoming edges are done 
      const incomingEdges = workflow.edges.filter(
        (e) => e.toNodeId === nextNode.id
      )

      if (incomingEdges.length > 0) {
        let allIncomingDone = true;

        for (const incomingEdge of incomingEdges) {
          const incomingTask = await tx.task.findFirst({
            where: {
              workflowId: workflow.id,
              nodeId: incomingEdge.fromNodeId,
            },
          });

          if (!incomingTask || incomingTask.status !== "DONE") {
            allIncomingDone = false;
            break;
          }
        }

        if (!allIncomingDone) continue;
      }


      const alreadyExists = await tx.task.findFirst({
        where: {
          workflowId: workflow.id,
          nodeId: nextNode.id,
        }
      })

      if (alreadyExists) continue;

      const newTask = await tx.task.create({
        data: {
          organizationId: task.organizationId,
          workflowId: workflow.id,
          nodeId: nextNode.id,
          title: nextNode.config.title ?? null,
          assignedTo: nextNode.config.assignedTo ?? null,
          dueDate: nextNode.config.dueDate ? new Date(nextNode.config.dueDate) : null,
          status: "PENDING",
        }
      })


      if (nextNode.type === "approval") {

        if (!nextNode.config.approver) {
          throw new Error("Approval node missing approver");
        }
        await tx.approval.create({
          data: {
            taskId: newTask.id,
            approverId: nextNode.config.approver,
            status: "PENDING",
          }
        })
      }
    }


    const remaining = await tx.task.count({
      where: {
        workflowId: workflow.id,
        status: { not: "DONE", },

      }
    })


    if (remaining === 0) {
      await tx.workflow.update({
        where: { id: workflow.id },
        data: { status: "COMPLETED" },
      })

      await logWorkflowEvent({
        tx,
        workflowId: workflow.id,
        action: "WORKFLOW_COMPLETED",
      });

    }


  })
}
