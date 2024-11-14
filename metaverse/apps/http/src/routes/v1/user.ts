import { Router } from "express";

export const userRouter = Router();

userRouter.post("/metadata", (req, res) => {
    res.json({
        message: "User Metadata"
    })
})

userRouter.get("/metadata/bulk", (req, res) => {
    res.json({
        message: "Bulk User Metadata"
    })
})
