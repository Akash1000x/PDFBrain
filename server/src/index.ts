import express from "express";
import "dotenv/config"
import cors from 'cors'
import router from "./routes/route.js";

const port = process.env.PORT || 8000;

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api", router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});
