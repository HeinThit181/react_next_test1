import { useUser } from "../context/UserProvider";
import { useCallback, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

export default function Profile() {
  const { logout } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [data, setData] = useState({});
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  function setMessages({ success = "", error = "" }) {
    setSuccessMessage(success);
    setErrorMessage(error);
  }

  function updateFormField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function applyProfile(nextProfile) {
    setData(nextProfile || {});
    setFormData({
      firstname: nextProfile?.firstname || "",
      lastname: nextProfile?.lastname || "",
      email: nextProfile?.email || "",
    });
  }

  async function onUpdateImage() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return setMessages({ error: "Please select an image file." });
    if (!file.type.startsWith("image/")) return setMessages({ error: "Only image file types are allowed." });

    const form = new FormData();
    form.append("file", file);

    setIsUploadingImage(true);
    setMessages({});

    try {
      const response = await fetch(`${API_URL}/api/user/profile/image`, {
        method: "POST",
        body: form,
        credentials: "include",
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        await fetchProfile();
        if (fileInputRef.current) fileInputRef.current.value = "";
        setMessages({ success: "Profile image updated." });
      } else {
        const result = await response.json().catch(() => null);
        setMessages({ error: result?.message || "Failed to update image." });
      }
    } catch {
      setMessages({ error: "Error uploading image." });
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function onDeleteImage() {
    setIsDeletingImage(true);
    setMessages({});

    try {
      const response = await fetch(`${API_URL}/api/user/profile/image`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        await fetchProfile();
        setMessages({ success: "Profile image removed." });
      } else {
        const result = await response.json().catch(() => null);
        setMessages({ error: result?.message || "Failed to remove image." });
      }
    } catch {
      setMessages({ error: "Error removing image." });
    } finally {
      setIsDeletingImage(false);
    }
  }

  async function onSaveProfile(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessages({});

    const payload = {
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      email: formData.email.trim(),
    };

    try {
      const result = await fetch(`${API_URL}/api/user/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (result.status === 401) {
        logout();
        return;
      }

      if (!result.ok) {
        const errorData = await result.json().catch(() => null);
        setMessages({ error: errorData?.message || "Failed to update profile." });
        return;
      }

      const updatedProfile = await result.json();
      applyProfile(updatedProfile);
      setMessages({ success: "Profile updated." });
    } catch {
      setMessages({ error: "Profile update failed." });
    } finally {
      setIsSaving(false);
    }
  }

  const fetchProfile = useCallback(async () => {
    try {
      const result = await fetch(`${API_URL}/api/user/profile`, {
        credentials: "include",
      });

      if (result.status === 401) {
        logout();
        return;
      }
      if (!result.ok) {
        console.log("Profile load failed:", result.status);
        return;
      }

      const nextData = await result.json();
      applyProfile(nextData);
    } catch (err) {
      console.log("Profile fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, logout]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const fullName = `${(data.firstname || "").trim()} ${(data.lastname || "").trim()}`.trim();
  const initial = (data.firstname || data.username || "U")[0] || "U";

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <div>
            <p className="eyebrow">Account</p>
            <h1 className="title">Profile</h1>
          </div>
          <div className="topbar-actions">
            <Link to="/users" className="btn btn-ghost">
              User Management
            </Link>
            <Link to="/logout" className="btn btn-danger">
              Logout
            </Link>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="profile-header">
              <div>
                <h2 className="title-sm">{fullName || "—"}</h2>
                <p className="muted">{data.email || "-"}</p>
                <div className="pill-row">
                  <span className="pill">{data.status || "ACTIVE"}</span>
                </div>
              </div>

              <div className="avatar avatar-lg">
                {data.profileImage ? (
                  <img src={`${API_URL}${data.profileImage}`} alt="Profile" />
                ) : (
                  <div className="avatar-fallback">{initial}</div>
                )}
              </div>
            </div>

            <div className="divider" />

            {isLoading ? (
              <div className="muted row-between">
                <span>Loading profile…</span>
                <span className="spinner" />
              </div>
            ) : (
              <form className="form" onSubmit={onSaveProfile}>
                <div className="field">
                  <label>User ID</label>
                  <input value={data._id || ""} readOnly />
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label>First Name</label>
                    <input
                      value={formData.firstname}
                      onChange={(event) => updateFormField("firstname", event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Last Name</label>
                    <input
                      value={formData.lastname}
                      onChange={(event) => updateFormField("lastname", event.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => updateFormField("email", event.target.value)}
                  />
                </div>

                <div className="row-between">
                  <button className="btn btn-primary" type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Profile"}
                  </button>
                  <span className="muted">Changes are saved to your account.</span>
                </div>
              </form>
            )}

            {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
          </div>

          <div className="card">
            <h3 className="title-sm">Profile Image</h3>
            <p className="muted">Upload a new avatar or remove the current one.</p>

            <div className="divider" />

            <div className="upload-box">
              <input type="file" ref={fileInputRef} accept="image/*" />
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={onUpdateImage} disabled={isUploadingImage}>
                  {isUploadingImage ? "Uploading..." : "Update Image"}
                </button>
                {data.profileImage && (
                  <button className="btn btn-danger" onClick={onDeleteImage} disabled={isDeletingImage}>
                    {isDeletingImage ? "Removing..." : "Remove Image"}
                  </button>
                )}
              </div>

              {(isUploadingImage || isDeletingImage) && (
                <div className="muted row" style={{ marginTop: 10, gap: 10 }}>
                  <span className="spinner" />
                  <span>Working…</span>
                </div>
              )}
            </div>

            <div className="hint">
              <strong>Supported:</strong> any image type. Best results: square images (e.g. 512×512).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
