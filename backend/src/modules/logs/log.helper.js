// src/services/log.helper.js

export const logTaskEvent = async ({
  tx,
  taskId,
  action,
  performedBy = null,
}) => {
  await tx.taskLog.create({
    data: {
      taskId,
      action,
      performedBy,
    },
  });
};

export const logWorkflowEvent = async ({
  tx,
  workflowId,
  action,
  performedBy = null,
}) => {
  await tx.workflowLog.create({
    data: {
      workflowId,
      action,
      performedBy,
    },
  });
};
