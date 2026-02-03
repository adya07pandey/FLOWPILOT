import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    let token = null;

    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: payload.userId,
      orgId: payload.orgId,
      role: payload.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default auth;
