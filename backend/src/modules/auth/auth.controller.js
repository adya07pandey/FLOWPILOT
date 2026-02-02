import * as authservice from './auth.service.js'

export const signup = async (req, res, next) => {

    try {
        const data = req.body;

        const token = await authservice.signup(data);

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        res.status(200).json({
            status: "Registered successfully",
            token
        });
    }
    catch (err) {
        next(err);
    }
}

export const login = async (req, res, next) => {
    try {
        const data = req.body;
        
        const token = await authservice.login(data);

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        res.status(200).json({
            status: "Logged in successfully",
            token
        })


    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export const logout = async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0)
    })
    res.status(200).json({
        status: "Logged out successfully",
    });
};

