import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Appcontext"; // 1. Import your context
import { auth } from "../../firebase"; // To get the token for submission

const RequestQuote: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, authReady } = useAuth(); // 2. Use context instead of local fetch

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [genModel, setGenModel] = useState("");
  const [genSerialNumber, setGenSerialNumber] = useState("");
  const [additionalInfo, setAdditionalNotes] = useState("");
  const [responseMsg, setResponseMsg] = useState("");


useEffect(() => {
      // 1. Wait until the AuthProvider has finished checking Firebase
    if (authReady) {
      // 2. If no user is found, send them to login
    if (!currentUser) {
      navigate("/userlogin");
      return;
    }

    // 3. If user exists, prefill the form from the Context data
    const fullName = (currentUser.name || "").trim();
    if (fullName) {
      const parts = fullName.split(" ");
      setFirstName(parts.shift() || "");
      setLastName(parts.join(" ") || "");
    }
    
    if (currentUser.email) setEmail(currentUser.email);
    // Use whatever field name you have in your MongoDB User model
    if (currentUser.phoneNumber) setPhoneNumber(currentUser.phoneNumber);
  }
}, [authReady, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseMsg("Submitting...");

    try {
      
      const token = await auth.currentUser?.getIdToken();

      const newQuote = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phoneNumber,
        genModel,
        genSerialNumber,
        additionalInfo,
      };


      const response = await fetch("http://localhost:3000/api/quotes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 5. Add authorization header
        },
        body: JSON.stringify(newQuote),
      });

      const result = await response.json();

      if (!response.ok) {
        setResponseMsg(result.message || "Error creating quote.");
      } else {
        setResponseMsg("Quote created successfully!");
        // Clear specific generator fields
        setGenModel("");
        setGenSerialNumber("");
        setAdditionalNotes("");
      }
    } catch (error) {
      setResponseMsg("Error connecting to server.");
      console.error(error);
    }
  };

  // If we're still checking auth, show a small loader or return null
  if (!authReady) return null;

  return (
    <>
      <Navbar />
      <div style={{ fontFamily: "Arial, sans-serif", padding: "2rem", background: "#f9f9f9", minHeight: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Request A Quote</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
            maxWidth: "600px",
            width: "100%",
            margin: "2rem auto",
          }}
        >
          {/* Inputs remain the same as your code, but added styling to the button */}
          <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} />
          <input name = "email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required style={inputStyle} />
          <input name = "Generator Model" type="text" placeholder="Generator Model" value={genModel} onChange={(e) => setGenModel(e.target.value)} required style={inputStyle} />
          <input name = "Generator Serial Number" type="text" placeholder="Generator Serial Number" value={genSerialNumber} onChange={(e) => setGenSerialNumber(e.target.value)} required style={inputStyle} />
          <textarea name = "Additional Information" placeholder="Additional Information" value={additionalInfo} onChange={(e) => setAdditionalNotes(e.target.value)} required style={textAreaStyle} />

          <div style={{ textAlign: "center" }}>
            <button 
              type="submit" 
              style={{ padding: "0.75rem 2rem", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem" }}
            >
              Submit Quote Request
            </button>
          </div>
        </form>

        {responseMsg && (
          <p style={{ textAlign: "center", marginTop: "1rem", color: responseMsg.includes("Error") ? "red" : "green", fontWeight: "bold" }}>
            {responseMsg}
          </p>
        )}
      </div>
      <Footer />
    </>
  );
};

// Reusable styles to keep code clean
const inputStyle: React.CSSProperties = {
  display: "block",
  width: "90%",
  margin: "0.8rem auto",
  padding: "0.75rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const textAreaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "120px",
  resize: "vertical",
  fontFamily: "Arial, sans-serif",
};

export default RequestQuote;