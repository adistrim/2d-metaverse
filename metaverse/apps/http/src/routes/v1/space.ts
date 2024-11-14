import { Router } from "express";

export const spaceRouter = Router();

spaceRouter.post("/", (req, res) => {
    res.json({
        message: "Create Space"
    })
});

spaceRouter.delete("/:spaceId", (req, res) => {
    res.json({
        message: "Delete Space"
    })
});

spaceRouter.get("/all", (req, res) => {
    res.json({
        message: "All Space"
    })
});

spaceRouter.delete("/:spaceId", (req, res) => {
    res.json({
        message: "Delete Space"
    })
});

spaceRouter.post("/element", (req, res) => {
    res.json({
        message: "Space"
    })
});

spaceRouter.delete("/element", (req, res) => {
    res.json({
        message: "Space"
    })
});


spaceRouter.get("/:spaceId", (req, res) => {
    res.json({
        message: "Space"
    })
})