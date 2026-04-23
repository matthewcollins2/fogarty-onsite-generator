import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
// 1. Import Firebase Auth
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

// Regular Expression section
const passwordRegex = /^(?=(?:.*[A-Z]){2,})(?=(?:.*[a-z]){2,})(?=(?:.*\d){2,})(?=(?:.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]){2,}).{12,}$/
const nameRegex = /[~`!@#$%^&*()0-9_=+[\]{}|\\;:"<,>./?]+|(\s{2,})|(^ $)/
const userIDRegex = /[\s]/  // checks for whitespace
const emailRegex = /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/
const phoneRegex = /(^\d{10}$){1}/
const streetRegex = /[~`!@#$%^*()_=+[\]{}|\\;<>/?]+|(\s{2,})|(^ $)/   // checks for special characters
const cityRegex = /[~`!@#$%^&*()_=+[\]{}|\\;:"<,>/?]+|(\s{2,})|(^ $)/ // checks for special characters
const stateAbbreviations = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];
const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/  // ex) 12345 or 12345-6789

const UserRegistration: React.FC = () => {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [userID, setUserID] = useState(""); // This can now be the Firebase UID
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [receiveTexts, setReceiveTexts] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);

  // Address Fields
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");

  // form inputs
  let buffArray = [fname, lname, userID, email, phoneNumber, password, street, city, state, zipcode];

  // validity buffers
  const [validBuff1, setValidBuff1] = useState(true);
  const [validBuff2, setValidBuff2] = useState(true);
  const [validBuff3, setValidBuff3] = useState(true);
  const [validBuff4, setValidBuff4] = useState(true);
  const [validBuff5, setValidBuff5] = useState(true);
  const [validBuff6, setValidBuff6] = useState(true);
  const [validBuff7, setValidBuff7] = useState(true);
  const [validBuff8, setValidBuff8] = useState(true);
  const [validBuff9, setValidBuff9] = useState(true);
  const [validBuff10, setValidBuff10] = useState(true);

  const [responseMsg, setResponseMsg] = useState("");
  const [disableButton, setDisableButton] = useState(true);

  // Checks if the string matches the regular expression format
  const checkRegex = (label: string, format: RegExp, userInput: string, match: boolean) => {
    const result = format.test(userInput);  // test the regexp
    // match used to check if we want to match or not match the regexp
    if (match) {
      result ? setInput(label, userInput, false) : setInput(label, userInput, true) // True means pass/valid input, should allow it
    } else { 
      result ? setInput(label, userInput, true) : setInput(label, userInput, false) // True means failed/invalid input, shouldn't allow it
    }
  }

  // Uses the label to know which form sent the request and which buffers to change
  const setInput = (label: string, userInput: string, invalid: boolean) => {
    setDisableButton(invalid);
    switch(label) {
      case 'First Name':
        setValidBuff1(!invalid);
        setFname(userInput);
        break;
      case 'Last Name':
        setValidBuff2(!invalid);
        setLname(userInput);
        break;
      case 'userID':
        setValidBuff3(!invalid);
        setUserID(userInput);
        break;
      case 'Email':
        setValidBuff4(!invalid);
        setEmail(userInput);
        break;
      case 'Phone Number':
        setValidBuff5(!invalid);
        setPhoneNumber(userInput);
        break;
      case 'Password':
        setValidBuff6(!invalid);
        setPassword(userInput);
        break;
      case 'Street':
        setValidBuff7(!invalid);
        setStreet(userInput);
        break;
      case 'City':
        setValidBuff8(!invalid);
        setCity(userInput);
        break;
      case 'State':
        setValidBuff9(!invalid);
        setState(userInput);
        break;
      case 'ZIP':
        setValidBuff10(!invalid);
        setZipcode(userInput);
        break;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseMsg("Creating account...");

    try {
      // 2. Create User in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const firebaseUser = userCredential.user;

      // 3. Prepare the data for MongoDB
      const name = `${fname} ${lname}`;
      const address = {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zipcode: zipcode.trim(),
      };

      const newUser = {
        _id: firebaseUser.uid, // Use Firebase UID as the primary key for MongoDB
        name,
        userID: firebaseUser.uid, // Linking the two systems
        email,
        phoneNumber,
        address,
        receiveTexts,
        receiveEmails,
      };
      const idToken = await firebaseUser.getIdToken();
      // 4. Send the data to your Node.js API
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}` // 👈 ADD THIS HEADER
        },
        body: JSON.stringify(newUser),
      })
      const result = await response.json();

      if (!response.ok) {
        setResponseMsg(
          result.message ||
            "Firebase account created, but database sync failed.",
        );
      } else {
        setResponseMsg("Account created successfully!");
        // Clear fields
        setFname("");
        setLname("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
        setStreet("");
        setCity("");
        setState("");
        setZipcode("");
      }
    } catch (error: any) {
      // Handle Firebase-specific errors (e.g., email already in use)
      setResponseMsg(error.message || "Error connecting to server.");
      console.error(error);
    }
  };

  return (
    <>
      {/* ===== Navbar Section ===== */}
      <Navbar />
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "2rem",
          background: "#f9f9f9",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1>Request An Account</h1>
        </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          margin: "auto",
        }}
      >

        <div style={{ textAlign: "center" }}>
          < TextField placeholder="First Name" variant="outlined"
            value={fname}
            onChange={(e) => checkRegex("First Name", nameRegex, e.target.value, false)}
            error={!validBuff1}
            helperText = {!validBuff1 ? "Please do not use special characters or spaces" : ''}
          />
          < TextField placeholder="Last Name" variant="outlined"
            value={lname}
            onChange={(e) => checkRegex("Last Name", nameRegex, e.target.value, false)}
            error={!validBuff2}
            helperText = {!validBuff2 ? "Please do not use special characters or spaces" : ''}
          />
          < TextField placeholder="User ID" variant="outlined"
            value={userID}
            onChange={(e) => checkRegex("userID", userIDRegex, e.target.value, false)}
            error={!validBuff3}
            helperText = {!validBuff3 ? "Please do not use spaces" : ''}
          />
          < TextField placeholder="Email" variant="outlined"
            value={email}
            onChange={(e) => checkRegex("Email", emailRegex, e.target.value, true)}
            error={!validBuff4}
            helperText = {!validBuff4 ? "Please enter a valid email" : ''}
          />
          < TextField placeholder="Phone Number" variant="outlined"
            value={phoneNumber}
            onChange={(e) => checkRegex("Phone Number", phoneRegex, e.target.value, true)}
            error={!validBuff5}
            helperText = {!validBuff5 ? "Please enter a valid phone number" : ''}
          />
          < TextField placeholder="Password" variant="outlined" type="password"
            value={password}
            onChange={(e) => checkRegex("Password", passwordRegex, e.target.value, true)}
            error={!validBuff6}
            helperText = {!validBuff6 ? "Password must be at least 12 characters long and include at least 2 uppercase, 2 lowercase, 2 numbers, and 2 special characters." : ''}
          />
          <div>
            <label
            style={{
              display: "block",
              textAlign: "center",
              marginTop: "0.75rem",
            }}
            ></label>
            <input
              type="checkbox"
              checked={receiveTexts}
              onChange={(e) => setReceiveTexts(e.target.checked)}
              style={{ marginRight: "0.5rem" }}
            />
            Receive Texts
            <input
              type="checkbox"
              checked={receiveEmails}
              onChange={(e) => setReceiveEmails(e.target.checked)}
              style={{ marginRight: "0.5rem" }}
            />
            Receive Emails
            <label
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "0.5rem",
              }}
            ></label>
          </div>
          < TextField placeholder="Street" variant="outlined"
            value={street}
            onChange={(e) => checkRegex("Street", streetRegex, e.target.value, false)}
            error={!validBuff7}
            helperText = {!validBuff7 ? "Please enter a valid street" : ''}
          />
          < TextField placeholder="City" variant="outlined"
            value={city}
            onChange={(e) => checkRegex("City", cityRegex, e.target.value, false)}
            error={!validBuff8}
            helperText = {!validBuff8 ? "Please enter a valid city" : ''}
          />
          <div>
            <InputLabel >State</InputLabel>
            <Select
              value={state}
              onChange={(e) => setState(e.target.value)}
              input={<OutlinedInput label="State" />}
            >
              {stateAbbreviations.map((state) => (
                <MenuItem key={state} value={state} >
                  {state}
                </MenuItem>
              ))}
            </Select>
          </div>
          < TextField placeholder="ZIP Code" variant="outlined"
            value={zipcode}
            onChange={(e) => checkRegex("ZIP", zipRegex, e.target.value, true)}
            error={!validBuff10}
            helperText = {!validBuff10 ? "Please enter a valid ZIP code" : ''}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          {/* Disables button if there is an invalid input or empty input*/}
          <Button variant="contained" disabled={disableButton || buffArray.some(element => element=="")} onClick={handleSubmit}>Create User</Button>
        </div>
      </form>
        {responseMsg && (
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            {responseMsg}
          </p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default UserRegistration;
