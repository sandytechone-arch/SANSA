import { useListAdminConversations } from "@workspace/api-client-react";
import { MessageSquare, User } from "lucide-react";

export default function AdminConversationsPage() {
  const { data: convs, isLoading, isError } = useListAdminConversations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading conversations...
      </div>
    );
  }

  if (isError || !convs) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        Failed to load conversations. Make sure you are logged in as an admin.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Conversations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {convs.length} total {convs.length === 1 ? "conversation" : "conversations"}
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Title
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Messages
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {convs.map((conv) => (
              <tr
                key={conv.id}
                className="border-b border-border hover:bg-secondary/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground truncate max-w-xs">
                      {conv.title}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    {conv.userEmail ?? "Guest"}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {conv.messageCount}
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {convs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No conversations yet.
          </div>
        )}
      </div>
    </div>
  );
}
