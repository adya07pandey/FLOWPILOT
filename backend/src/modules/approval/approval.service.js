import { prisma } from "../../config/db.js"
import { logTaskEvent, logWorkflowEvent } from "../logs/log.helper.js";

export const approveTask = async ({ approvalId, userId }) => {
    return prisma.$transaction(async (tx) => {

        const approval = await tx.approval.findUnique({
            where: { id: approvalId },
            include: { task: true },
        });

        if (!approval || approval.status !== "PENDING") {
            throw new Error("Approval not pending");
        }

        await tx.approval.update({
            where: { id: approvalId },
            data: {
                status: "ACCEPTED",
                decidedAt: new Date(),
            },
        });

        const task = await tx.task.update({
            where: { id: approval.taskId },
            data: {
                status: "DONE",
                completedOn: new Date(),
            },
            include: {
                workflow: {
                    include: {
                        nodes: true,
                        edges: true,
                    }
                }
            }
        });

        await logTaskEvent({
            tx,
            taskId: approval.taskId,
            action: "TASK_APPROVED",
            performedBy: userId,
        });

        await logWorkflowEvent({
            tx,
            workflowId: approval.task.workflowId,
            action: "TASK_APPROVED",
            performedBy: userId,
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




        return { message: "Task approved" };

    });
};



export const rejectTask = async ({ approvalId, userId }) => {
    return prisma.$transaction(async (tx) => {

        const approval = await tx.approval.findUnique({
            where: { id: approvalId },
            include: { task: true },
        });

        if (!approval || approval.status !== "PENDING") {
            throw new Error("Approval not pending");
        }

        await tx.approval.update({
            where: { id: approvalId },
            data: {
                status: "REJECTED",
                decidedAt: new Date(),
            },
        });

        await tx.task.update({
            where: { id: approval.taskId },
            data: {
                status: "BLOCKED",
            },
        });

        await tx.workflow.update({
            where: { id: approval.task.workflowId },
            data: {
                status: "REJECTED",
            },
        });


        await tx.taskLog.create({
            data: {
                taskId: approval.taskId,
                action: "TASK_REJECTED",
                performedBy: userId,
            },
        });

        await logTaskEvent({
            tx,
            taskId: approval.taskId,
            action: "TASK_REJECTED",
            performedBy: userId,
        });

        await logWorkflowEvent({
            tx,
            workflowId: approval.task.workflowId,
            action: "WORKFLOW_HALTED",
            performedBy: userId,
        });


        return { message: "Task rejected, workflow halted" };
    });
};


