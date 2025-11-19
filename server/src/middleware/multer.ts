import multer from "multer";
import path from "path";
import { getRootDirname } from "../utils/paths.js";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(getRootDirname(), "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
  }
})

export const upload = multer({ storage });
