import { prisma } from "../../config/db.js";
import validateWorkflow from "./workflow.validator.js"
import {logWorkflowEvent} from "../logs/log.helper.js"
export const createWorkflow = async ({ userId, orgId, name, nodes, edges }) => {

    if (!nodes || nodes.length === 0) {
        throw new Error("Workflow must have at least one node");
    }

    edges = edges || [];


    validateWorkflow(nodes, edges);

    return prisma.$transaction(async (tx) => {

        const createworkflow = await tx.workflow.create({
            data: {
                name,
                organizationId: orgId,
                status: "DRAFT",
                createdBy: userId,

            }
        });


        const nodeIDMap = {};

        for (const node of nodes) {

            const createnode = await tx.workflowNode.create({
                data: {
                    workflowId: createworkflow.id,
                    type: node.type,
                    config: node.config,
                    position: node.position
                }
            });

            nodeIDMap[node.id] = createnode.id;

        }

        for (const edge of edges) {

            const createedge = await tx.workflowEdge.create({
                data: {
                    workflowId: createworkflow.id,
                    fromNodeId: nodeIDMap[edge.fromNodeId],
                    toNodeId: nodeIDMap[edge.toNodeId]
                }
            });
        }

        await logWorkflowEvent({
            tx,
            workflowId: createworkflow.id,
            action: "WORKFLOW_STARTED",
            performedBy: userId,
        });

        return createworkflow;
    });

}

export const getWorkflows = async ({ orgId, userId }) => {
    return prisma.workflow.findMany({
        where: { organizationId: orgId, createdBy: userId },
        orderBy:{
            createdAt:"desc"
        },
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        }
    })
}

export const getWorkflowById = async ({ workflowId, orgId }) => {
    const workflow = await prisma.workflow.findFirst({
        where: {
            id: workflowId,
            organizationId: orgId,
        },
        include: {
            nodes: true,
            edges: true,
        }
    })

    if (!workflow) {
        throw new Error("Workflow not found");
    }
    return workflow;
}
