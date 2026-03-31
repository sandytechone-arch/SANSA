import { Router } from "express";
import { db, usersTable, conversations, messages, siteConfigTable } from "@workspace/db";
import { count, eq, gte, sql } from "drizzle-orm";
import { UpdateUserRoleBody, UpdateUserRoleParams } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalUsersResult] = await db.select({ count: count() }).from(usersTable);
    const [totalConversationsResult] = await db.select({ count: count() }).from(conversations);
    const [totalMessagesResult] = await db.select({ count: count() }).from(messages);

    const [convTodayResult] = await db
      .select({ count: count() })
      .from(conversations)
      .where(gte(conversations.createdAt, startOfToday));

    const [usersTodayResult] = await db
      .select({ count: count() })
      .from(usersTable)
      .where(gte(usersTable.createdAt, startOfToday));

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyConvRows = await db
      .select({
        date: sql<string>`DATE(${conversations.createdAt})`.as("date"),
        conversations: count(),
      })
      .from(conversations)
      .where(gte(conversations.createdAt, sevenDaysAgo))
      .groupBy(sql`DATE(${conversations.createdAt})`);

    const dailyMsgRows = await db
      .select({
        date: sql<string>`DATE(${messages.createdAt})`.as("date"),
        messages: count(),
      })
      .from(messages)
      .where(gte(messages.createdAt, sevenDaysAgo))
      .groupBy(sql`DATE(${messages.createdAt})`);

    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const convRow = dailyConvRows.find((r) => r.date === dateStr);
      const msgRow = dailyMsgRows.find((r) => r.date === dateStr);
      dailyActivity.push({
        date: dateStr,
        conversations: convRow?.conversations ?? 0,
        messages: msgRow?.messages ?? 0,
      });
    }

    res.json({
      totalUsers: totalUsersResult.count,
      totalConversations: totalConversationsResult.count,
      totalMessages: totalMessagesResult.count,
      conversationsToday: convTodayResult.count,
      usersToday: usersTodayResult.count,
      dailyActivity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);

    const convCounts = await db
      .select({
        userId: conversations.userId,
        count: count(),
      })
      .from(conversations)
      .groupBy(conversations.userId);

    const result = users.map((u) => {
      const cc = convCounts.find((c) => c.userId === u.id);
      return {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        profileImageUrl: u.profileImageUrl,
        role: u.role,
        createdAt: u.createdAt,
        conversationCount: cc?.count ?? 0,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.patch("/admin/users/:id/role", requireAdmin, async (req, res) => {
  const { id } = UpdateUserRoleParams.parse(req.params);
  const { role } = UpdateUserRoleBody.parse(req.body);

  const [updated] = await db
    .update(usersTable)
    .set({ role })
    .where(eq(usersTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [cc] = await db
    .select({ count: count() })
    .from(conversations)
    .where(eq(conversations.userId, id));

  res.json({ ...updated, conversationCount: cc?.count ?? 0 });
});

router.get("/admin/conversations", requireAdmin, async (req, res) => {
  try {
    const convRows = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        createdAt: conversations.createdAt,
        userId: conversations.userId,
        userEmail: usersTable.email,
      })
      .from(conversations)
      .leftJoin(usersTable, eq(conversations.userId, usersTable.id))
      .orderBy(sql`${conversations.createdAt} DESC`);

    const msgCounts = await db
      .select({
        conversationId: messages.conversationId,
        count: count(),
      })
      .from(messages)
      .groupBy(messages.conversationId);

    const result = convRows.map((c) => {
      const mc = msgCounts.find((m) => m.conversationId === c.id);
      return {
        id: c.id,
        title: c.title,
        createdAt: c.createdAt,
        userId: c.userId,
        userEmail: c.userEmail,
        messageCount: mc?.count ?? 0,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.get("/site-config", async (_req, res) => {
  try {
    const configs = await db.select().from(siteConfigTable);
    const configMap: Record<string, string> = {};
    for (const c of configs) {
      configMap[c.key] = c.value;
    }
    res.json({
      welcomeMessage: configMap["welcomeMessage"] || "",
      primaryColor: configMap["primaryColor"] || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch site config" });
  }
});

router.get("/admin/config", requireAdmin, async (_req, res) => {
  try {
    const configs = await db.select().from(siteConfigTable);
    const configMap: Record<string, string> = {};
    for (const c of configs) {
      configMap[c.key] = c.value;
    }
    res.json({
      systemPrompt: configMap["systemPrompt"] || "",
      welcomeMessage: configMap["welcomeMessage"] || "",
      primaryColor: configMap["primaryColor"] || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch config" });
  }
});

router.put("/admin/config", requireAdmin, async (req, res) => {
  try {
    const { systemPrompt, welcomeMessage, primaryColor } = req.body;

    const entries = [
      { key: "systemPrompt", value: systemPrompt || "" },
      { key: "welcomeMessage", value: welcomeMessage || "" },
      { key: "primaryColor", value: primaryColor || "" },
    ];

    for (const entry of entries) {
      await db
        .insert(siteConfigTable)
        .values(entry)
        .onConflictDoUpdate({
          target: siteConfigTable.key,
          set: { value: entry.value, updatedAt: new Date() },
        });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update config" });
  }
});

export default router;
