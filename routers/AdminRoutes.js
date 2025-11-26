import * as AdminController from "../controllers/AdminControllers.js";
import express from "express";

const AdminRoutes = express.Router();

AdminRoutes.get("/all", AdminController.Getall);
AdminRoutes.post("/register", AdminController.register);
AdminRoutes.post("/login", AdminController.login);

export default AdminRoutes;