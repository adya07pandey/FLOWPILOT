import * as authservice from "./auth.service.js";

const cookieOptions = {

  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 1000 * 60 * 60 * 24 * 7
  
};

export const signup = async (req, res, next) => {

  try {
    const data = req.body;
    
    const token = await authservice.signup(data);

    res.cookie("jwt", token, cookieOptions);

    res.status(200).json({
      status: "Registered successfully"
    });

  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  
    try {

    const data = req.body;
    const token = await authservice.login(data);

    res.cookie("jwt", token, cookieOptions);

    res.status(200).json({
      status: "Logged in successfully"
    });


  } catch (err) {
    res.status(400).json({ message: err.message });
  }


};

export const logout = async (req, res) => {
 
    res.cookie("jwt", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0)
  });


  res.status(200).json({
    status: "Logged out successfully"
  });


};
