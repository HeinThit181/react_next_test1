import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageBusy, setIsImageBusy] = useState(false);
  const [modalMessage, setModalMessage] = useState({ type: "", text: "" });

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    firstname: "",
    lastname: "",
  });

  const imageInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  function setUserInList(updatedUser) {
    setUsers((prev) =>
      prev.map((u) => (u._id === updatedUser._id ? { ...u, ...updatedUser } : u))
    );
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingUser(null);
    setIsSaving(false);
    setIsImageBusy(false);
    setModalMessage({ type: "", text: "" });
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  async function fetchUsers() {
    try {
      const res = await fetch(`${API_URL}/api/user`);
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
      else console.error("API did not return a list:", data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert("Username, email and password are required");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        const msg = await res.text();
        alert("Create failed: " + msg);
        return;
      }

      await fetchUsers();
      setNewUser({
        username: "",
        email: "",
        password: "",
        firstname: "",
        lastname: "",
      });

      alert("User created. They can now log in.");
    } catch (error) {
      console.error("Create failed:", error);
      alert("Create failed");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_URL}/api/user/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setUsers((prev) => prev.filter((u) => u._id !== id));
      if (editingUser?._id === id) closeModal();
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  }

  function openEditModal(user) {
    setEditingUser({ ...user });
    setModalMessage({ type: "", text: "" });
    setIsModalOpen(true);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  }

  async function saveUser() {
    if (!editingUser) return;
    setIsSaving(true);
    setModalMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_URL}/api/user/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: editingUser.firstname,
          lastname: editingUser.lastname,
          email: editingUser.email,
        }),
      });

      if (res.ok) {
        setUserInList(editingUser);
        setModalMessage({ type: "success", text: "User updated successfully." });
      } else {
        const msg = await res.text();
        setModalMessage({ type: "error", text: "Failed to update user. " + msg });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setModalMessage({ type: "error", text: "Error updating user." });
    } finally {
      setIsSaving(false);
    }
  }

  async function updateUserImage() {
    if (!editingUser) return;

    const file = imageInputRef.current?.files?.[0];
    if (!file) return setModalMessage({ type: "error", text: "Please select an image file first." });
    if (!file.type.startsWith("image/")) return setModalMessage({ type: "error", text: "Only image file types are allowed." });

    setIsImageBusy(true);
    setModalMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/user/${editingUser._id}/image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setModalMessage({ type: "error", text: result.message || "Failed to update image." });
        return;
      }

      const updated = { ...editingUser, profileImage: result.imageUrl };
      setEditingUser(updated);
      setUserInList(updated);
      if (imageInputRef.current) imageInputRef.current.value = "";
      setModalMessage({ type: "success", text: "Image updated successfully." });
    } catch (error) {
      console.error("Failed to update image:", error);
      setModalMessage({ type: "error", text: "Failed to update image." });
    } finally {
      setIsImageBusy(false);
    }
  }

  async function removeUserImage() {
    if (!editingUser) return;

    setIsImageBusy(true);
    setModalMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_URL}/api/user/${editingUser._id}/image`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setModalMessage({ type: "error", text: result.message || "Failed to remove image." });
        return;
      }

      const updated = { ...editingUser, profileImage: null };
      setEditingUser(updated);
      setUserInList(updated);
      setModalMessage({ type: "success", text: "Image removed successfully." });
    } catch (error) {
      console.error("Failed to remove image:", error);
      setModalMessage({ type: "error", text: "Failed to remove image." });
    } finally {
      setIsImageBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="title">User Management</h1>
            <p className="subtitle">Create, edit, or remove accounts</p>
          </div>
          <div className="topbar-actions">
            <Link to="/profile" className="btn btn-ghost">Back to Profile</Link>
            <button className="btn btn-primary" onClick={fetchUsers}>Refresh</button>
          </div>
        </div>

        <div className="card">
          <h3 className="title-sm">Create User</h3>
          <form className="form" onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="field">
                <label>Username *</label>
                <input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
              </div>
              <div className="field">
                <label>Email *</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Password *</label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              </div>
              <div className="field">
                <label>First Name</label>
                <input value={newUser.firstname} onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })} />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Last Name</label>
                <input value={newUser.lastname} onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })} />
              </div>
              <div className="row" style={{ alignItems: "end", justifyContent: "flex-end" }}>
                <button className="btn btn-primary" type="submit">Add User</button>
              </div>
            </div>
          </form>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="row-between" style={{ marginBottom: 10 }}>
            <h3 className="title-sm" style={{ margin: 0 }}>Users</h3>
            <span className="pill">{users.length} total</span>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Image</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="avatar avatar-sm">
                        {user.profileImage ? (
                          <img src={`${API_URL}${user.profileImage}`} alt={`${user.username || "user"} profile`} />
                        ) : (
                          <div className="avatar-fallback">
                            {(user.firstname || user.username || "U")[0]}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {user.firstname} {user.lastname}
                      </div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        @{user.username}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td><span className="pill">{user.status || "ACTIVE"}</span></td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="btn btn-ghost" onClick={() => openEditModal(user)}>
                        Edit
                      </button>{" "}
                      <button className="btn btn-danger" onClick={() => handleDelete(user._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="muted" style={{ textAlign: "center", padding: 18 }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && editingUser && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="row-between">
                <div>
                  <h3 className="title-sm" style={{ margin: 0 }}>Edit User</h3>
                  <p className="muted" style={{ margin: 0 }}>Update user details and profile image.</p>
                </div>
                <button className="btn btn-ghost" onClick={closeModal}>Close</button>
              </div>

              <div className="divider" />

              <div className="modal-image-panel">
                <div className="avatar avatar-lg">
                  {editingUser.profileImage ? (
                    <img src={`${API_URL}${editingUser.profileImage}`} alt={`${editingUser.username || "user"} profile`} />
                  ) : (
                    <div className="avatar-fallback">
                      {(editingUser.firstname || editingUser.username || "U")[0]}
                    </div>
                  )}
                </div>

                <div className="modal-image-controls">
                  <input type="file" accept="image/*" ref={imageInputRef} />
                  <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                    <button className="btn btn-primary" onClick={updateUserImage} disabled={isImageBusy}>
                      {isImageBusy ? "Working..." : "Update Image"}
                    </button>
                    {editingUser.profileImage && (
                      <button className="btn btn-danger" onClick={removeUserImage} disabled={isImageBusy}>
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {modalMessage.text && (
                <div className={`alert ${modalMessage.type === "error" ? "alert-error" : "alert-success"}`}>
                  {modalMessage.text}
                </div>
              )}

              <div className="grid-2">
                <div className="field">
                  <label>First Name</label>
                  <input name="firstname" value={editingUser.firstname || ""} onChange={handleInputChange} />
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <input name="lastname" value={editingUser.lastname || ""} onChange={handleInputChange} />
                </div>
              </div>

              <div className="field">
                <label>Email</label>
                <input type="email" name="email" value={editingUser.email || ""} onChange={handleInputChange} />
              </div>

              <div className="row-between" style={{ marginTop: 14 }}>
                <button className="btn btn-primary" onClick={saveUser} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(editingUser._id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
