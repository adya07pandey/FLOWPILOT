import { prisma } from "../../config/db.js";

export const getDashboardStats = async ({ orgId }) => {

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const DAYS = 10;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (DAYS - 1));
  startDate.setHours(0, 0, 0, 0);


  const BOTTLENECK_THRESHOLD_HOURS = 0.01;
  const BOTTLENECK_THRESHOLD_MS = BOTTLENECK_THRESHOLD_HOURS * 60 * 60 * 1000;

  const [totalTasks, completedToday, completedTasks, pendingApprovals, activeWorkflows,
    taskStatusChart, slowCandidateTasks, workflowTasks,
    overdueTasksRaw,] = await Promise.all([

      //totalTasks
      prisma.task.count({ where: { organizationId: orgId } }),

      //task-completed-today
      prisma.task.count({
        where: {
          status: "DONE",
          completedOn: { gte: startOfToday, lte: endOfToday },
          organizationId: orgId,
        },
      }),


      //completedTasks for avg-comlpetion time
      prisma.task.findMany({
        where: {
          status: "DONE",
          completedOn: { not: null },
          organizationId: orgId,
        },
        select: { createdAt: true, completedOn: true },
      }),

      //pending approvals
      prisma.approval.count({
        where: {
          status: "PENDING",
          task: { organizationId: orgId },
        },
      }),

      //active-workflow
      prisma.workflow.count({
        where: {
          status: "ACTIVE",
          organizationId: orgId,
        },
      }),

      //task-status-chart
      prisma.task.groupBy({
        by: ["status"],
        where: {
          organizationId: orgId,
        },
        _count: {
          status: true,
        },
      }),

      //slow-candidate-tasks for bottleneck
      prisma.task.findMany({
        where: {
          status: "DONE",
          completedOn: { not: null },
          organizationId: orgId,
        },
        select: {
          createdAt: true,
          completedOn: true,
          nodeId: true,
          title: true,
        },
      }),

      //workflow-tasks for workflow-performance
      prisma.task.findMany({
        where: {
          status: "DONE",
          completedOn: { not: null },
          organizationId: orgId,
        },
        orderBy:{
          createdAt:"desc",
        },
        select: {
          createdAt: true,
          completedOn: true,
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      //overdueTasks
      prisma.task.findMany({
        where: {
          organizationId: orgId,
          dueDate: {
            not: null,
            lt: new Date(),
          },
          status: {
            in: ["PENDING", "IN_PROGRESS", "BLOCKED"],
          },
        },
        orderBy: {
          dueDate: "desc",
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          status: true,
          assignee: {
            select: {
              id: true,
              name: true,
            },
          },
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),


    ]);

  //avg-completion-time
  const avgCompletionMs =
    completedTasks.length > 0
      ? completedTasks.reduce(
        (sum, t) => sum + (t.completedOn - t.createdAt),
        0
      ) / completedTasks.length
      : 0;

  const avgCompletionTime =
    avgCompletionMs > 0
      ? (avgCompletionMs / (1000 * 60 * 60)).toFixed(1)
      : 0;

  //task-status-chart
  const taskStatusStats = taskStatusChart.map((item) => ({
    status: item.status,
    count: item._count.status,
  }));



  //Bottleneck 
  const bottleneckMap = {};

  slowCandidateTasks.forEach((t) => {
    const durationMs = t.completedOn - t.createdAt;

    if (durationMs > BOTTLENECK_THRESHOLD_MS && t.nodeId) {
      if (!bottleneckMap[t.nodeId]) {
        bottleneckMap[t.nodeId] = {
          nodeId: t.nodeId,
          nodeName: t.nodeId,
          nodeType: "UNKNOWN",

          delayedTasks: 0,
          totalDelayMs: 0,
        };
      }

      bottleneckMap[t.nodeId].delayedTasks += 1;
      bottleneckMap[t.nodeId].totalDelayMs += durationMs;
    }
  });

  const bottleneckSteps = Object.values(bottleneckMap)
    .map((n) => ({
      nodeId: n.nodeId,
      nodeName: n.nodeName,
      nodeType: n.nodeType,
      delayedTasks: n.delayedTasks,
      avgDelayHours: +(
        n.totalDelayMs /
        n.delayedTasks /
        (1000 * 60 * 60)
      ).toFixed(1),
    }))
    .sort((a, b) => b.delayedTasks - a.delayedTasks);


  //workflow-performance
  const workflowMap = {};

  workflowTasks.forEach((t) => {
    const wfId = t.workflow.id;

    if (!workflowMap[wfId]) {
      workflowMap[wfId] = {
        workflowName: t.workflow.name,
        runs: 0,
        totalTimeMs: 0,
      };
    }

    workflowMap[wfId].runs += 1;
    workflowMap[wfId].totalTimeMs +=
      (t.completedOn?.getTime() || 0) - t.createdAt.getTime()

  });

  const workflowPerformance = Object.values(workflowMap).map(
    (wf) => ({
      workflowName: wf.workflowName,
      runs: wf.runs,
      avgTimeHours: +(wf.totalTimeMs / wf.runs / (1000 * 60 * 60)).toFixed(1),
    })
  );
  workflowPerformance.sort((a, b) => b.runs - a.runs);


  //user-tasks-workload
  const tasksForUserWorkload = await prisma.task.findMany({
    where: { organizationId: orgId },
    select: {
      status: true,
      assignee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const userWorkloadMap = {};

  tasksForUserWorkload.forEach((t) => {
    if (!t.assignee) return;

    const id = t.assignee.id;

    if (!userWorkloadMap[id]) {
      userWorkloadMap[id] = {
        userId: id,
        userName: t.assignee.name,
        totalTasks: 0,
        completedTasks: 0,
      };
    }

    userWorkloadMap[id].totalTasks += 1;

    if (t.status === "DONE") {
      userWorkloadMap[id].completedTasks += 1;
    }
  });

  const userWorkload = Object.values(userWorkloadMap).sort(
    (a, b) => b.totalTasks - a.totalTasks
  );



  //running-workflows
  // running-workflows with progress
  const runningWorkflowGroups = await prisma.task.groupBy({
    by: ["workflowId", "status"],
    where: {
      organizationId: orgId,
      status: {
        in: ["PENDING", "IN_PROGRESS", "BLOCKED", "DONE"],
      },
    },
    _count: {
      _all: true,
    },
  });

  const workflowProgressMap = {};

  runningWorkflowGroups.forEach((g) => {
    const wfId = g.workflowId;

    if (!workflowProgressMap[wfId]) {
      workflowProgressMap[wfId] = {
        workflowId: wfId,
        totalTasks: 0,
        completedTasks: 0,
      };
    }

    workflowProgressMap[wfId].totalTasks += g._count._all;

    if (g.status === "DONE") {
      workflowProgressMap[wfId].completedTasks += g._count._all;
    }
  });
  const runningWorkflowIds = Object.values(workflowProgressMap)
    .filter(wf => wf.completedTasks < wf.totalTasks)
    .map(wf => wf.workflowId);
  const workflows = await prisma.workflow.findMany({
    where: { id: { in: runningWorkflowIds } },
    select: { id: true, name: true },
  });
  const runningWorkflows = workflows.map((wf) => {
    const stats = workflowProgressMap[wf.id];

    const progress = stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

    return {
      id: wf.id,
      name: wf.name,
      progress,
      completedTasks: stats.completedTasks,
      totalTasks: stats.totalTasks,
    };
  });


  //overdue tasks
  const overdueTasks = overdueTasksRaw.map((t) => ({
    taskId: t.id,
    title: t.title,
    status: t.status,
    dueDate: t.dueDate,
    assignedTo: t.assignee?.name || "Unassigned",
    workflowName: t.workflow?.name || "No Workflow",
    overdueByHours: Math.max(
      0,
      ((Date.now() - new Date(t.dueDate)) / (1000 * 60 * 60)).toFixed(1)
    ),
  }));
  

  //workflowstats
  const workflowTaskGroups = await prisma.task.groupBy({
    by: ["workflowId", "status"],
    where: {
      organizationId: orgId,
    },
    _count: {
      _all: true,
    },
  });
  const workflowStatusMap = {};

  workflowTaskGroups.forEach((g) => {
    const wfId = g.workflowId;

    if (!workflowStatusMap[wfId]) {
      workflowStatusMap[wfId] = {
        workflowId: wfId,
        totalTasks: 0,
        pending: 0,
        inProgress: 0,
        blocked: 0,
        done: 0,
      };
    }

    workflowStatusMap[wfId].totalTasks += g._count._all;

    if (g.status === "PENDING") workflowStatusMap[wfId].pending += g._count._all;
    if (g.status === "IN_PROGRESS") workflowStatusMap[wfId].inProgress += g._count._all;
    if (g.status === "BLOCKED") workflowStatusMap[wfId].blocked += g._count._all;
    if (g.status === "DONE") workflowStatusMap[wfId].done += g._count._all;
  });
  let running = 0;
  let completed = 0;
  let pending = 0;
  let blocked = 0;

  Object.values(workflowStatusMap).forEach((wf) => {
    if (wf.blocked > 0) {
      blocked++;
      running++; // blocked workflows are still running
      return;
    }

    if (wf.done === wf.totalTasks) {
      completed++;
      return;
    }

    if (wf.pending === wf.totalTasks) {
      pending++;
      return;
    }

    running++;
  });
  const workflowStats = {
    running,
    completed,
    pending,
    blocked,
  };

  //new task today
  const newTasksToday = await prisma.task.count({
  where: {
    organizationId: orgId,
    createdAt: {
      gte: startOfToday,
      lte: endOfToday,
    },
  },
});

//tasks completed
const toLocalDateKey = (date) =>
  date.toLocaleDateString("en-CA"); // YYYY-MM-DD


const completedTasksByDayRaw = await prisma.task.findMany({
  where: {
    organizationId: orgId,
    status: "DONE",
    completedOn: {
      gte: startDate,
    },
  },
  select: {
    completedOn: true,
  },
});


const completedTasksByDayMap = {};

completedTasksByDayRaw.forEach((t) => {
  const day = toLocalDateKey(new Date(t.completedOn));

  completedTasksByDayMap[day] =
    (completedTasksByDayMap[day] || 0) + 1;
});

const completedTasksByDay = [];

for (let i = DAYS - 1; i >= 0; i--) {
  const d = new Date();
  d.setDate(d.getDate() - i);

  const key = toLocalDateKey(d);

  completedTasksByDay.push({
    date: key,
    count: completedTasksByDayMap[key] || 0,
  });
}


const todayKey = toLocalDateKey(new Date());

const todayIndex = completedTasksByDay.findIndex(
  (d) => d.date === todayKey
);

if (todayIndex !== -1) {
  completedTasksByDay[todayIndex].count = completedToday;
}


  return { totalTasks, completedToday, avgCompletionTime, pendingApprovals, activeWorkflows, taskStatusStats,
     bottleneckSteps, workflowPerformance, userWorkload, runningWorkflows, overdueTasks, workflowStats,newTasksToday,completedTasksByDay };
};
