import bcrypt from "bcryptjs";
import { prisma } from "../../config/db.js";

const ALLOWED_ROLES = ["MANAGER", "EMPLOYEE"];

export const invitehim = async ({ inviter, email, name, role }) => {

  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error("Invalid role");
  }

  return prisma.$transaction(async (tx) => {
   
    let user = await tx.user.findUnique({
      where: { email },
    });

    if (!user) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash("abcd1234", 10);

      user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });
    }

    const membershipExist = await tx.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: inviter.orgId,
        },
      },
    });

    if (membershipExist) {
      throw new Error("User already in organization");
    }

    await tx.membership.create({
      data: {
        userId: user.id,
        organizationId: inviter.orgId,
        role,
      },
    });

    return {
      message: "User successfully invited",
      email,
      role,
    };
  });
};
