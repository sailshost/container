import express from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import routes from "./routes";

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use("/v1", routes);

app.listen(42069, () => console.log("Container API is running on port 42069"));
