import { prisma } from "../src/config/db.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1️⃣ Organization
  let org = await prisma.organization.findFirst({
    where: { name: "Nebula Tech" },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: { name: "Nebula Tech" },
    });
  }


  // 2️⃣ Users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "aarav@nebula.com" },
      update: {},
      create: {
        name: "Aarav Sharma",
        email: "aarav@nebula.com",
        passwordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "meera@nebula.com" },
      update: {},
      create: {
        name: "Meera Iyer",
        email: "meera@nebula.com",
        passwordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "rohan@nebula.com" },
      update: {},
      create: {
        name: "Rohan Patel",
        email: "rohan@nebula.com",
        passwordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "ananya@nebula.com" },
      update: {},
      create: {
        name: "Ananya Singh",
        email: "ananya@nebula.com",
        passwordHash,
      },
    }),
  ]);

  const [admin, manager, emp1, emp2] = users;

  // 3️⃣ Memberships (safe)
  await prisma.membership.createMany({
    data: [
      { userId: admin.id, organizationId: org.id, role: "ADMIN" },
      { userId: manager.id, organizationId: org.id, role: "MANAGER" },
      { userId: emp1.id, organizationId: org.id, role: "EMPLOYEE" },
      { userId: emp2.id, organizationId: org.id, role: "EMPLOYEE" },
    ],
    skipDuplicates: true,
  });

  // 4️⃣ Workflow
  let workflow = await prisma.workflow.findFirst({
    where: {
      name: "Employee Onboarding",
      organizationId: org.id,
    },
  });

  if (!workflow) {
    workflow = await prisma.workflow.create({
      data: {
        name: "Employee Onboarding",
        status: "ACTIVE",
        createdBy: admin.id,
        organizationId: org.id,
      },
    });
  }


  // 5️⃣ Nodes
  const [node1, node2, node3] = await Promise.all([
    prisma.workflowNode.create({
      data: {
        workflowId: workflow.id,
        type: "task",
        config: { title: "Collect Documents", assignedTo: emp1.id },
        position: { x: 100, y: 100 },
      },
    }),
    prisma.workflowNode.create({
      data: {
        workflowId: workflow.id,
        type: "approval",
        config: { title: "Manager Approval", approver: manager.id },
        position: { x: 300, y: 100 },
      },
    }),
    prisma.workflowNode.create({
      data: {
        workflowId: workflow.id,
        type: "task",
        config: { title: "Create Email & Access", assignedTo: emp2.id },
        position: { x: 500, y: 100 },
      },
    }),
  ]);

  // 6️⃣ Edges
  await prisma.workflowEdge.createMany({
    data: [
      { workflowId: workflow.id, fromNodeId: node1.id, toNodeId: node2.id },
      { workflowId: workflow.id, fromNodeId: node2.id, toNodeId: node3.id },
    ],
  });

  // 7️⃣ Tasks (spread across days)
  const daysAgo = (n) => new Date(Date.now() - n * 86400000);

  await prisma.task.createMany({
    data: [
      {
        organizationId: org.id,
        workflowId: workflow.id,
        nodeId: node1.id,
        title: "Collect Documents",
        assignedTo: emp1.id,
        status: "DONE",
        completedOn: daysAgo(2),
      },
      {
        organizationId: org.id,
        workflowId: workflow.id,
        nodeId: node3.id,
        title: "Create Email & Access",
        assignedTo: emp2.id,
        status: "IN_PROGRESS",
        dueDate: daysAgo(-2),
      },
    ],
  });

  console.log("✅ Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
