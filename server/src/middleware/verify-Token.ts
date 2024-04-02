const jwt = require("jsonwebtoken");

const verifyToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer")) {
    return res.status(401).send("Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(404).send("No token found!");
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET_KEY,
    (err: any, decoded: any) => {
      if (err) {
        return res.status(403).send("Invalid token");
      }
      req.user = decoded.user;
      next();
    } 
  );
};

export default verifyToken;
