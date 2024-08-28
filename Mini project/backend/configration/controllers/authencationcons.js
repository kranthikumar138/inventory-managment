const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateToken, verifyToken } = require("../middlewares/auth");

const redis = require("redis");

const client = redis.createClient();

client.on("error", (err) => {
  console.error("There was an error connecting to Redis:", err);
});

client.connect();

exports.register = async (req, res) => {
  const { username, email, role, password, confirm_password } = req.body;

  try {
    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      role,
      password_hash: hashedPassword,
    });

    await client.set("isNewUserAdded", "true");

    const token = generateToken(user);



    res.status(201).json({
      success: true,
      message: "User created successfully",
      token: token,
      data: user,
    });
  } catch (err) {
    console.error("Error during user registration:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password_hash } = req.body;

  try {
    const cachedUser = await client.get(`user_${username}`);
    
    if (cachedUser) {
      const user = JSON.parse(cachedUser);


      const checkPasswordMatching = await bcrypt.compare(
        password_hash,
        user.password_hash
      );

      if (!checkPasswordMatching) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const token = generateToken(user);
      return res.status(200).json({ success: true, token: token, data: user });
    }

   
    User.findByUsername(username, async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error: " + err.message });
      }

      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

  
      const checkPasswordMatching = await bcrypt.compare(
        password_hash,
        user.password_hash
      );

      if (!checkPasswordMatching) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

     
      await client.set(`user_${username}`, JSON.stringify(user), 'EX', 3600); 

      const token = generateToken(user);
      res.status(200).json({ success: true, token: token, data: user });
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};