import { useState } from "react";
import { createPortal } from "react-dom";
import { inviteUsers } from "../api/orgusers";
import { useAuth } from "../context/AuthContext";

export default function InviteUser({ setInviteOpen }) {
    const [form, setForm] = useState({ name: "", email: "", role: "" });
    const [error, setError] = useState("");
    const [showInvite, setShowInvite] = useState(false);
    const { user } = useAuth();
    const [success, setSuccess] = useState("");


    const open = () => {
        setShowInvite(true);
        setInviteOpen(true);
    };

    const close = () => {
        setShowInvite(false);
        setInviteOpen(false);
        setError("");
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const invite = async () => {
        try {
            await inviteUsers(form);
            setSuccess("User invited successfully");

            setTimeout(() => {
                close();
                setSuccess("");
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.message || "Could not invite user");
        }

    };

    return (
        <>
            {/* ✅ BUTTON — stays in sidebar */}
            <div className="b">
                <button className="leftsidebar-inviteuser" onClick={open}>
                    Invite User
                </button>
            </div>

            {/* ✅ MODAL — goes to portal */}
            {showInvite &&
                createPortal(
                    <div className="inviteuser" onClick={close}>
                        <div
                            className="dialoguebox"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h1>Invite User</h1>

                            <label>Name</label>
                            <input name="name" onChange={handleChange} />

                            <label>Email</label>
                            <input name="email" onChange={handleChange} />

                            <label>Role</label>
                            <select name="role" onChange={handleChange}>
                                <option value="">Select role</option>
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                            </select>

                            {error && <div className="invite-error">{error}</div>}

                            <button className="invitebtn" onClick={invite}>
                                Invite
                            </button>
                            {success && <div className="invite-success">{success}</div>}

                        </div>
                    </div>,
                    document.getElementById("modal-root")
                )}
        </>
    );
}
