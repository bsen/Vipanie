import express, { Router } from "express";
import dotenv from "dotenv";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
import shopRouter from "./routes/shop/shop";

app.use("/api/shop", shopRouter);

app.get("/", (req, res) => {
  return res.json({ status: 200, message: "VIPANIE SERVER IS LIVE" });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
