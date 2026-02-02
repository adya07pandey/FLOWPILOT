import "../styles/Home.css"
import { useNavigate } from "react-router-dom"

export default function Home(){

    const navigate= useNavigate()
    return(
        <>
            <div className="nav"> 
                <div className="logo"><img src="/logo.png" alt="Logo" /></div>
                <div className="loginbox">
                    <button className="signup" onClick={()=>navigate("../signup")}>Signup</button>
                    <button className="login" onClick={()=>navigate("../login")}> Login</button>
                </div>
            </div>

            <div className="main-home">
                
                <div className="h1">
                    Design. Automate. Track.
                   
                </div>
                <div className="h1"> 
                    Your workflows, tasks, and approvals — all in one place.
</div>
                <div className="h2">
                    Build powerful workflows, assign tasks effortlessly, and track progress
      in real time. <br />Stay in control from start to finish.
                </div>
            </div>


            
        </>
    )
}