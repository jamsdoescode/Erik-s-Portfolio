import dotenv from "dotenv";
import path from "node:path";

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), ".env.local"), override: true });
