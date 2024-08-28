import React, { useState } from "react";
import axios from "axios";

function CreateUserComponent() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreateUser = async () => {
    if (!username || !email || !role || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(""); 
    setSuccess(""); 

    const payload = {
      username,
      email,
      role,
      password, 
    };

    try {
      const response = await axios.post(
        'http://localhost:4040/api/user/register',
        payload
      );
      console.log(response.data);
      setSuccess("User created successfully!");
    } catch (error) {
      console.error(error);
      setError("Error creating user");
    }
  };

  return (
    <div>
      <h1>Create User</h1>
      <br />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <label>Enter Your Username:</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter Your username here"
      />
      <br />
      <label>Enter Your Email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter Your Email here"
      />
      <br />
      <label>Enter Your Role:</label>
      <input
        type="text"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="Enter your Role here"
      />
      <br />
      <label>Enter Your Password:</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your Password here"
      />
      <br />
      <label>Enter Your Confirm Password:</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Enter your Confirm Password here"
      />
      <br />
      <button onClick={handleCreateUser}>Signup</button>
    </div>
  );
}

export default CreateUserComponent;
