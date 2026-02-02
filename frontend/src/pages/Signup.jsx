import { useState } from "react";
import "../styles/Login.css"
import { useNavigate } from "react-router-dom";
import { signup } from "../api/auth"
import { useAuth } from "../context/AuthContext";

export default function Signup() {
    const navigate = useNavigate();
    const { fetchUser } = useAuth();
    const [form, setForm] = useState({
        name: "", email: "", password: "", organizationname: "",
    });

    const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!form.name.trim()) return "Name is required";
        
        if (!form.organizationname.trim()) return "Organization name is required";

        if (!form.email.trim()) return "Emil is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            return "Enter a valid email address";
        }

        if(!form.password) return "Password is required";
        if(form.password.length<8){
            return "Password must be at least 8 characters";
        }

        return null;
    };


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSignup = async () => {
        const validationError = validateForm();
        if(validationError){
            setError(validationError);
            return;
        }
        try {
            setLoading(true);
            setError("");
            await signup(form);
            await fetchUser();
            
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed");
            
        }finally{
            setLoading(false);
        }
    }


    return (

        <div className="signup-container">
            <h1>Create Account!</h1>
            <input className="input-field" name="name" type="text" placeholder="Name" onChange={handleChange} />
            <input className="input-field" name="organizationname" type="text" placeholder="Organization" onChange={handleChange} />
            <input className="input-field" name="email" type="email" placeholder="Email" onChange={handleChange} />
            <input className="input-field" name="password" type="password" placeholder="Password" onChange={handleChange} />
            {error && <p style={{color:"#ff6b6b"}}>{error}</p>}
            <button className="login-btn" disabled={loading} onClick={handleSignup}> Signup</button>
            <p>
                Already have an account?
                <button className="signup-change" onClick={() => navigate("../login")}>Login</button>
            </p>

        </div>
    )

}



