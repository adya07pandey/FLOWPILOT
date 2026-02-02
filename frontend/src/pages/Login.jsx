import { useState } from "react";
import "../styles/Login.css"
import { useNavigate } from "react-router-dom"
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Login(){
    const navigate = useNavigate(); 
    const {fetchUser} = useAuth();
    const [form,setForm] = useState({email:"", password:""});
    const [error,setError] = useState("");

    const handleChange = (e) => {
        setForm({...form,[e.target.name]:e.target.value});
    };

    

    const handleLogin = async() => {
        try{
            await login(form);
            await fetchUser();
            navigate("/dashboard");
        }catch(err){
            setError(err.response?.data?.message || "Login failed");
        }
    }
    return (
        
        <div className="login-container">
                <h1>Welcome Back!</h1>
                <input className="input-field" name="email" type="email" placeholder="Email" onChange={handleChange} />
                <input className="input-field" name="password" type="password" placeholder="Password" onChange={handleChange}/>

                {error && <p style={{color:"#ff6b6b"}}>{error}</p>}

                <button className="login-btn" onClick={handleLogin}> Login</button>
                <p>
                    Don't have an account?     
                    <button className="signup-change" onClick={()=>navigate("../signup")}>Sign Up</button> 
                </p>
            
            </div>
 
    )
   
}

