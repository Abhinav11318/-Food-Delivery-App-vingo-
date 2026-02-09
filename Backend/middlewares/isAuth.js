import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token, unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Token verification failed" });
    }

    // 👇 Make sure this key matches your JWT sign() payload
    req.userId = decoded.userId || decoded.id;

    next();
  } catch (error) {
    console.error("isAuth error:", error);
    return res.status(500).json({ message: "isAuth error: " + error.message });
  }
};

export default isAuth;
