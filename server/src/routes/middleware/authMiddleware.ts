import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const shopMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: 401,
      message: "Authorization header is missing",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Bearer token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).shop = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: "Invalid token",
    });
  }
};

export default shopMiddleware;
