import { useState } from "react";
import { useListAdminUsers, useUpdateUserRole } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, User, MessageSquare, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        role === "admin"
          ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
          : role === "special"
            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
            : "bg-secondary text-muted-foreground",
      )}
    >
      {role === "admin" && <Shield className="w-3 h-3" />}
      {role === "special" && <Sparkles className="w-3 h-3" />}
      {role}
    </span>
  );
}

function UserRow({ user }: { user: any }) {
  const queryClient = useQueryClient();
  const mutation = useUpdateUserRole();
  const [open, setOpen] = useState(false);

  const handleRole = (newRole: "user" | "admin" | "special") => {
    setOpen(false);
    mutation.mutate(
      { id: user.id, data: { role: newRole } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }) },
    );
  };

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown";

  return (
    <tr className="border-b border-border hover:bg-secondary/30 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user.email ?? "—"}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MessageSquare className="w-3.5 h-3.5" />
          {user.conversationCount}
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="py-3 px-4">
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors text-foreground"
          >
            Change role <ChevronDown className="w-3 h-3" />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded-lg shadow-xl z-10">
              {(["user", "special", "admin"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRole(r)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center gap-2",
                    user.role === r
                      ? "text-primary font-medium"
                      : "text-foreground",
                  )}
                >
                  {r === "admin" && <Shield className="w-3 h-3" />}
                  {r === "special" && <Sparkles className="w-3 h-3" />}
                  {r === "user" && <User className="w-3 h-3" />}
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const { data: users, isLoading, isError } = useListAdminUsers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading users...
      </div>
    );
  }

  if (isError || !users) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        Failed to load users. Make sure you are logged in as an admin.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {users.length} registered {users.length === 1 ? "user" : "users"}
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Chats
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Joined
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No users yet.
          </div>
        )}
      </div>
    </div>
  );
}
