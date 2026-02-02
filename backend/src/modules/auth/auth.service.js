import bcrypt from "bcryptjs"
import { prisma } from "../../config/db.js"
import jwt from "jsonwebtoken"

export const signup = async ({ name, email, password, organizationname }) => {

  //email check
  const existingemail = await prisma.user.findUnique({ where: { email } });

  if (existingemail) {
    throw new Error("Email already exists");
  }

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Invalid email" });
  }


  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password too short" });
  }
  //hash password
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(password, salt);

  // transaction

  const { user, org } = await prisma.$transaction(async (tx) => {

    const user = await tx.user.create({
      data: { name, email, passwordHash }
    });

    const org = await tx.organization.create({
      data: { name: organizationname }
    });

    await tx.membership.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: "ADMIN"
      }
    });

    return { user, org };
  })

  // token generation

  // jwt.sign(payload, secretkey, options)
  return jwt.sign(
    { userId: user.id, orgId: org.id, role: "ADMIN" },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }

  );


}


export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("Email not registered");
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Wrong Password");
  }
  
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id }
  });

  if (!membership) {
    throw new Error("User has no organization");
  }
  
  return jwt.sign(
    {
      userId: user.id,
      orgId: membership.organizationId,
      role: membership.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );
};






