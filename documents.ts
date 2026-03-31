import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, documents } from "@workspace/db";

const router = Router();

const FILE_TYPES = ["pdf", "excel", "word", "ppt"] as const;
type FileType = (typeof FILE_TYPES)[number];

router.get("/", async (req, res) => {
  try {
    const userId = req.isAuthenticated() ? req.user.id : null;

    const rows = userId
      ? await db
          .select()
          .from(documents)
          .where(eq(documents.userId, userId))
          .orderBy(desc(documents.createdAt))
      : [];

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list documents");
    res.status(500).json({ error: "Failed to list documents" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, fileType, content, conversationId } = req.body as {
      title?: string;
      fileType?: string;
      content?: string;
      conversationId?: string | null;
    };

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "title is required" });
    }
    if (!fileType || !(FILE_TYPES as readonly string[]).includes(fileType)) {
      return res.status(400).json({ error: "fileType must be one of pdf, excel, word, ppt" });
    }
    if (typeof content !== "string") {
      return res.status(400).json({ error: "content is required" });
    }

    const userId = req.isAuthenticated() ? req.user.id : null;

    const [doc] = await db
      .insert(documents)
      .values({
        userId,
        conversationId: conversationId ?? null,
        title,
        fileType: fileType as FileType,
        content,
      })
      .returning();

    res.status(201).json(doc);
  } catch (err) {
    req.log.error({ err }, "Failed to save document");
    res.status(500).json({ error: "Failed to save document" });
  }
});

router.delete("/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid document id" });
    }

    const userId = req.user.id;

    const deleted = await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete document");
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;
