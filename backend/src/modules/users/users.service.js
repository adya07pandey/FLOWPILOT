import { prisma } from "../../config/db.js";

export const getOrgUsers = async (orgId) => {
  const users = await prisma.membership.findMany({
    where: {
      organizationId: orgId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const orgUsers = users.map((m) => m.user);

  

  return orgUsers;
};


export const getOrgName = async (orgId) => {
  const org = await prisma.organization.findUnique({
    where:{
      id:orgId,
    },
  })
  if(!org){
    throw new Error("Organization not found");
  }
  return org.name;
}