import { Request, Response } from "express";
import User from "../model/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "fallback_secret";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).send({ message: "Invalid email or password" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.status(400).send({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ email, role: user.role }, secret, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      maxAge: 3600000, // 1 hour in milliseconds
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(200).send(userWithoutPassword);
    return;
  } catch (err) {
    console.log(err instanceof Error ? err.message : "Unknown error");
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body.user;
    const user = await User.find({ email: email });
    if (user.length > 0) {
      res
        .status(400)
        .send({ message: "This usesername has been already used" });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    req.body.user.password = hash;

    const userData = new User(req.body.user);
    await userData.save();
    res.status(201).send({ message: "register successful" });
  } catch (err) {
    console.log(err instanceof Error ? err.message : "Unknown error");
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });

    res.status(200).send({ message: "Logout successful" });
  } catch (err) {
    console.log(err instanceof Error ? err.message : "Unknown error");
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const currentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).send({ message: "Unauthorized: No token provided" });
      return;
    }

    const decoded = jwt.verify(token, secret) as {
      email: string;
      role: string;
    };

    const user = await User.findOne({ email: decoded.email }).select(
      "-password",
    ); // Exclude password from the response
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    res.status(200).send(user);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).send({ message: "Unauthorized: Invalid token" });
    } else {
      console.log(err instanceof Error ? err.message : "Unknown error");
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
};
