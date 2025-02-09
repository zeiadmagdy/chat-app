import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


export const signup = async (req, res) => {
    res.send("Signup route");
    const { email, fullName, password } = req.body;

    try {
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be atleast 6 characters" });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = bcrypt.genSalt(10);
        const hashedPassword = bcrypt(password, salt);

        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
        });


        

    } catch (error) {

    }
};

export const login = (req, res) => {
    res.send("login route");
};

export const logout = (req, res) => {
    res.send("logout route");
};