import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CircleHelp,
  Filter,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Ticket as TicketIcon,
  X,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type Role = "employee" | "engineer" | "lead";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: string;
  department?: string;
};

type Ticket = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  organization: string;
  createdByName: string;
  createdById?: string;
  assignedToName?: string;
  assignedToId?: string;
  resolutionNote?: string;
  createdAt: string;
};

type ApiTicket = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  status?: string;
  organization?: string;
  createdBy?: string | { id?: string; _id?: string; name?: string };
  createdByName?: string;
  assignedTo?: string | { id?: string; _id?: string; name?: string };
  assignedToName?: string;
  resolutionNote?: string;
  createdAt?: string;
};

const demoAccounts = [
  { label: "Employee", email: "employee@linkup.demo" },
  { label: "Support engineer", email: "engineer@linkup.demo" },
  { label: "Team lead", email: "lead@linkup.demo" },
  { label: "Other tenant", email: "employee@acme.demo" },
];

function displayStatus(value: string | undefined): string {
  const normalized = String(value || "open")
    .replace("_", " ")
    .toLowerCase();

  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
}

function apiStatus(value: string): string {
  return value.trim().toLowerCase().replace(" ", "_");
}

function normalizeTicket(raw: ApiTicket): Ticket {
  const createdByObject =
    typeof raw.createdBy === "object" && raw.createdBy !== null ? raw.createdBy : undefined;
  const assignedToObject =
    typeof raw.assignedTo === "object" && raw.assignedTo !== null ? raw.assignedTo : undefined;

  const id = String(raw._id ?? raw.id ?? "");

  return {
    _id: id,
    title: String(raw.title ?? "Untitled ticket"),
    description: String(raw.description ?? ""),
    category: String(raw.category ?? "General"),
    priority: String(raw.priority ?? "medium").replace(/^\w/, (character) =>
      character.toUpperCase(),
    ),
    status: displayStatus(raw.status),
    organization: String(raw.organization ?? ""),
    createdByName: String(createdByObject?.name ?? raw.createdByName ?? "Unknown"),
    createdById: String(createdByObject?.id ?? createdByObject?._id ?? ""),
    assignedToName: String(assignedToObject?.name ?? raw.assignedToName ?? ""),
    assignedToId: String(assignedToObject?.id ?? assignedToObject?._id ?? ""),
    resolutionNote: String(raw.resolutionNote ?? ""),
    createdAt: String(raw.createdAt ?? ""),
  };
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("linkup-user") || "null");
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("linkup-token") || "");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState("lead@linkup.demo");
  const [password, setPassword] = useState("Demo123!");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Bug",
    priority: "Medium",
  });
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [editStatus, setEditStatus] = useState("Open");
  const [editAssignee, setEditAssignee] = useState("");
  const [editNote, setEditNote] = useState("");

  async function request(path: string, options: RequestInit = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
  }

  async function login(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("linkup-token", data.token);
      localStorage.setItem("linkup-user", JSON.stringify(data.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken("");
    setUser(null);
    setTickets([]);
    setUsers([]);
    localStorage.removeItem("linkup-token");
    localStorage.removeItem("linkup-user");
  }

  async function loadData() {
    if (!token || !user) return;

    setLoading(true);
    setError("");

    try {
      const [ticketData, userData] = await Promise.all([
        request(`/tickets?status=${encodeURIComponent(statusFilter)}`),
        request("/users").catch(() => []),
      ]);

      setTickets(
        Array.isArray(ticketData)
          ? ticketData.map((ticket: ApiTicket) => normalizeTicket(ticket))
          : [],
      );
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token && user) void loadData();
    
  }, [token, user, statusFilter]);

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await request("/tickets", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          priority:
            form.priority.toLowerCase() === "critical" ? "urgent" : form.priority.toLowerCase(),
        }),
      });

      setForm({
        title: "",
        description: "",
        category: "Bug",
        priority: "Medium",
      });
      setShowCreate(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  async function saveTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    setError("");
    setSubmitting(true);

    try {
      await request(`/tickets/${editing._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: apiStatus(editStatus),
          assignedTo: editAssignee,
          resolutionNote: editNote,
        }),
      });

      setEditing(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update ticket");
    } finally {
      setSubmitting(false);
    }
  }

  const visible = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return tickets.filter((ticket) =>
      `${ticket.title} ${ticket.description} ${ticket.createdByName}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [tickets, query]);

  const counts = {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "Open").length,
    progress: tickets.filter((ticket) => ticket.status === "In Progress").length,
    resolved: tickets.filter((ticket) => ticket.status === "Resolved").length,
  };

  const canManage = user?.role === "lead" || user?.role === "engineer";

  if (!user || !token) {
    return (
      <main className="login-page">
        <section className="login-art">
          <div className="brand">
            <span className="brand-mark">L</span> linkup
            <span className="brand-dot">.</span>
          </div>
          <div className="art-content">
            <span className="eyebrow">SUPPORT, CONNECTED</span>
            <h1>
              Every issue has
              <br />a way forward.
            </h1>
            <p>
              A shared workspace for teams to raise issues, collaborate with support, and get back
              to what matters.
            </p>
            <div className="art-stats">
              <div>
                <strong>One workspace</strong>
                <span>For every conversation</span>
              </div>
              <div>
                <strong>Clear ownership</strong>
                <span>From open to resolved</span>
              </div>
            </div>
          </div>
          <div className="art-footer">LINKUP SERVICE DESK · BUILT FOR TEAMS</div>
        </section>

        <section className="login-panel">
          <div className="login-box">
            <div className="mobile-brand brand">
              <span className="brand-mark">L</span> linkup
              <span className="brand-dot">.</span>
            </div>
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Sign in to Linkup</h2>
            <p className="muted">Access your team&apos;s support workspace.</p>

            {error && <div className="alert">{error}</div>}

            <form onSubmit={login} className="form-stack">
              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <button className="primary full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"} <ArrowUpRight size={17} />
              </button>
            </form>

            <div className="demo-box">
              <div className="demo-title">
                <ShieldCheck size={16} /> Demo accounts
                <span>password: Demo123!</span>
              </div>
              <div className="demo-list">
                {demoAccounts.map((account) => (
                  <button key={account.email} type="button" onClick={() => setEmail(account.email)}>
                    {account.label}
                    <span>{account.email}</span>
                  </button>
                ))}
              </div>
              <p>Choose a role above, then sign in with the demo password.</p>
            </div>
          </div>
          <div className="login-bottom">Secure workspace · Role-based access</div>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">L</span> linkup
          <span className="brand-dot">.</span>
        </div>

        <div className="workspace">
          <div className="workspace-icon">{(user.organization || "O").slice(0, 1)}</div>
          <div>
            <strong>{user.organization}</strong>
            <small>Support workspace</small>
          </div>
          <span className="workspace-menu">⌄</span>
        </div>

        <span className="nav-label">WORKSPACE</span>
        <button className="nav-item active" type="button">
          <LayoutDashboard size={18} /> Overview
        </button>
        <button className="nav-item" type="button" onClick={() => setStatusFilter("All")}>
          <TicketIcon size={18} /> All tickets
          <span className="nav-count">{tickets.length}</span>
        </button>
        <button className="nav-item" type="button" onClick={() => setStatusFilter("Open")}>
          <CircleHelp size={18} /> Open issues
        </button>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <ShieldCheck size={18} />
            </div>
            <strong>Need a hand?</strong>
            <p>Your support team is one ticket away.</p>
            <button type="button" onClick={() => setShowCreate(true)}>
              Create a ticket <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="profile">
            <div className="avatar">{initials(user.name)}</div>
            <div className="profile-copy">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </div>
            <button className="icon-button" type="button" onClick={logout} title="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace /</span> <strong>Overview</strong>
          </div>
          <div className="top-actions">
            <span className="online-dot" /> System operational
            <div className="avatar small">{initials(user.name)}</div>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">SUPPORT OPERATIONS</span>
              <h1>Good to see you, {user.name.split(" ")[0]}.</h1>
              <p>Here&apos;s what&apos;s happening across your support queue.</p>
            </div>
            <button className="primary" type="button" onClick={() => setShowCreate(true)}>
              <Plus size={17} /> New ticket
            </button>
          </div>

          {error && (
            <div className="alert">
              {error}
              <button type="button" onClick={() => setError("")}>
                <X size={15} />
              </button>
            </div>
          )}

          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-top">
                <span>Total tickets</span>
                <span className="metric-icon purple">
                  <TicketIcon size={18} />
                </span>
              </div>
              <strong>{counts.total}</strong>
              <small>Tickets in this view</small>
            </div>
            <div className="metric-card">
              <div className="metric-top">
                <span>Open</span>
                <span className="metric-icon orange">
                  <CircleHelp size={18} />
                </span>
              </div>
              <strong>{counts.open}</strong>
              <small>Awaiting support</small>
            </div>
            <div className="metric-card">
              <div className="metric-top">
                <span>In progress</span>
                <span className="metric-icon blue">
                  <Activity size={18} />
                </span>
              </div>
              <strong>{counts.progress}</strong>
              <small>Being worked on</small>
            </div>
            <div className="metric-card">
              <div className="metric-top">
                <span>Resolved</span>
                <span className="metric-icon green">
                  <CheckCircle2 size={18} />
                </span>
              </div>
              <strong>{counts.resolved}</strong>
              <small>Successfully closed</small>
            </div>
          </div>

          <section className="tickets-panel">
            <div className="panel-heading">
              <div>
                <h2>Support tickets</h2>
                <p>Track, assign, and resolve requests.</p>
              </div>
              <button className="outline" type="button" onClick={() => void loadData()}>
                <Activity size={15} /> Refresh
              </button>
            </div>

            <div className="table-tools">
              <div className="search-box">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tickets..."
                />
              </div>
              <div className="filter-box">
                <Filter size={15} />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option>All</option>
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>
            </div>

            <div className="ticket-table">
              <div className="table-head">
                <span>Ticket</span>
                <span>Requester</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Assigned to</span>
                <span>Created</span>
              </div>

              {loading && <div className="empty-state">Loading tickets…</div>}

              {!loading && visible.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <TicketIcon size={22} />
                  </div>
                  <strong>No tickets found</strong>
                  <p>Create a ticket to start tracking support requests.</p>
                </div>
              )}

              {!loading &&
                visible.map((ticket) => (
                  <button
                    className="ticket-row"
                    key={ticket._id}
                    type="button"
                    onClick={() => {
                      if (!canManage) return;
                      setEditing(ticket);
                      setEditStatus(ticket.status);
                      setEditAssignee(ticket.assignedToId || "");
                      setEditNote(ticket.resolutionNote || "");
                    }}
                  >
                    <div className="ticket-title">
                      <span className="ticket-id">
                        #
                        {String(ticket._id || "")
                          .slice(-6)
                          .toUpperCase()}
                      </span>
                      <strong>{ticket.title}</strong>
                      <small>
                        {ticket.category} ·{" "}
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString()
                          : "Date unavailable"}
                      </small>
                    </div>
                    <span>{ticket.createdByName}</span>
                    <span>
                      <i className={`priority-dot ${ticket.priority.toLowerCase()}`} />
                      {ticket.priority}
                    </span>
                    <span>
                      <i
                        className={`status-dot ${ticket.status.toLowerCase().replace(" ", "-")}`}
                      />
                      {ticket.status}
                    </span>
                    <span className="assignee">{ticket.assignedToName || "Unassigned"}</span>
                    <span className="date-cell">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "—"}
                      <ArrowUpRight size={14} />
                    </span>
                  </button>
                ))}
            </div>

            <div className="table-footer">
              <span>
                Showing {visible.length} ticket{visible.length === 1 ? "" : "s"}
              </span>
              <span>
                <span className="online-dot" /> Live from Linkup API
              </span>
            </div>
          </section>

          <div className="bottom-note">
            <ShieldCheck size={16} />
            <span>
              <strong>Organization-isolated workspace.</strong> Ticket queries are scoped to your
              organization; employee accounts only see their own requests.
            </span>
          </div>
        </div>
      </main>

      {showCreate && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <form className="modal" onSubmit={createTicket}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">NEW REQUEST</span>
                <h2>Create support ticket</h2>
                <p>Describe the issue and route it to your support team.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowCreate(false)}>
                <X />
              </button>
            </div>

            <label>
              Ticket title
              <input
                minLength={4}
                maxLength={120}
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="e.g. Unable to access reporting dashboard"
              />
            </label>

            <label>
              Description
              <textarea
                minLength={8}
                required
                rows={4}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="What happened? Include steps to reproduce if relevant."
              />
            </label>

            <div className="two-cols">
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                >
                  <option>Bug</option>
                  <option>Access</option>
                  <option>Question</option>
                  <option>Feature</option>
                </select>
              </label>
              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button className="primary" disabled={submitting}>
                <Plus size={16} />
                {submitting ? "Submitting…" : "Submit ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

      {editing && canManage && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <form className="modal" onSubmit={saveTicket}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">
                  #
                  {String(editing._id || "")
                    .slice(-6)
                    .toUpperCase()}
                </span>
                <h2>Update ticket</h2>
                <p>{editing.title}</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setEditing(null)}>
                <X />
              </button>
            </div>

            <label>
              Status
              <select value={editStatus} onChange={(event) => setEditStatus(event.target.value)}>
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
            </label>

            <label>
              Assign to
              <select
                value={editAssignee}
                onChange={(event) => setEditAssignee(event.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((supportUser) => (
                  <option key={supportUser.id} value={supportUser.id}>
                    {supportUser.name} · {supportUser.role}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Resolution / internal note
              <textarea
                rows={4}
                value={editNote}
                onChange={(event) => setEditNote(event.target.value)}
                placeholder="Document investigation or resolution…"
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="outline" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="primary" disabled={submitting}>
                {submitting ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
