import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import { useAuth } from "../../context/Appcontext";
import { auth } from "../../firebase";

import {
  Backdrop,
  Box,
  Button,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
  deleteUser,
} from "firebase/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api",
  withCredentials: true,
});

// Add Firebase ID token to all requests
api.interceptors.request.use(async (config) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error getting Firebase token:", error);
  }
  return config;
});

// Regular Expression section
const passwordRegex =
  /^(?=(?:.*[A-Z]){2,})(?=(?:.*[a-z]){2,})(?=(?:.*\d){2,})(?=(?:.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]){2,}).{12,}$/;
const nameRegex = /[~`!@#$%^&*()0-9_=+[\]{}|\\;:"<,>./?]+|(\s{2,})|(^ $)/;
const emailRegex =
  /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/;
const phoneRegex = /(^\d{10}$){1}/;
const streetRegex = /[~`!@#$%^*()_=+[\]{}|\\;<>/?]+|(\s{2,})|(^ $)/; // checks for special characters
const cityRegex = /[~`!@#$%^&*()_=+[\]{}|\\;:"<,>/?]+|(\s{2,})|(^ $)/; // checks for special characters
const stateAbbreviations = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/; // ex) 12345 or 12345-6789

const UserSettings = () => {
  const { currentUser, setCurrentUser, authReady, isAdmin } = useAuth();
  // On first render, try to hydrate from cookie via /users/me
  let fullAddress =
    currentUser?.address.street +
    ", " +
    currentUser?.address.city +
    ", " +
    currentUser?.address.state +
    " " +
    currentUser?.address.zipcode;
  const [buff1, setBuff1] = useState(""); // User settings to update
  const [buff2, setBuff2] = useState("");
  const [buff3, setBuff3] = useState("");
  const [buff4, setBuff4] = useState("");
  const [validBuff1, setValidBuff1] = useState(true);
  const [validBuff2, setValidBuff2] = useState(true);
  const [validBuff3, setValidBuff3] = useState(true);
  const [validBuff4, setValidBuff4] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const userAddress = {
    street: buff1,
    city: buff2,
    state: buff3,
    zipcode: buff4,
  };

  const [responseMsg, setResponseMsg] = useState("");
  const [disableButton, setDisableButton] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);
  const [disableDeleteButton, setDisableDeleteButton] = useState(true);

  // Fetch upcoming appointments for the current user
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!currentUser?.userID) {
        console.log("No userID available yet");
        return;
      }
      try {
        console.log("Fetching appointments for userID:", currentUser.userID);
        const response = await api.get(
          `/appointments/user/${currentUser.userID}`,
        );
        console.log("Appointments response:", response.data);
        const allAppointments = response.data;

        // Filter for future appointments only
        const userAppointments = allAppointments
          .filter((apt: any) => new Date(apt.appointmentDateTime) > new Date())
          .sort(
            (a: any, b: any) =>
              new Date(a.appointmentDateTime).getTime() -
              new Date(b.appointmentDateTime).getTime(),
          );

        console.log("Filtered upcoming appointments:", userAppointments);
        setAppointments(userAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [currentUser?.userID]);

  const handleCloseDelete = () => {
    setOpenDelete(false); // Closes the update confirmation
    setBuff1(""); // Sets the text fields to empty
    setValidBuff1(true);
    setDisableDeleteButton(true);
  };
  const handleOpenDelete = () => {
    setOpenDelete(true); // Brings up the update confirmation
  };
  const [receiveTexts, setReceiveTexts] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      setCurrentUser(null);
      alert("You have successfully been logged out.");
      window.location.href = "/"; // hard redirect to homepage after logout
    } catch (error) {
      console.error("Logout error:", error);
      setCurrentUser(null);
    }
  };

  const handleDeleteUser = async () => {
    let correctDetails = true;
    try {
      if (currentUser != null) {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(
          currentUser.email.toLowerCase().trim(),
          buff1.trim(),
        ); // confirms user
        if (user != null) {
          await reauthenticateWithCredential(user, credential); // reauth user
        }
      }
    } catch (err: any) {
      console.log(err);
      correctDetails = false;
      setResponseMsg("Wrong Information");
    }

    if (correctDetails) {
      try {
        // 2. Authenticate with Firebase directly
        const firebaseUser = auth.currentUser;
        if (firebaseUser != null && currentUser) {
          const idToken = await firebaseUser.getIdToken();
          // delete databa
          const response = await fetch(
            "http://localhost:3000/api/users/" + currentUser.userID,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
            },
          );
          const result = await response.json();
          await deleteUser(firebaseUser); // delete firebase user
          if (!response.ok) {
            setResponseMsg(result.message || "Error updating user."); // Show the backend error directly
          } else {
            setResponseMsg(result.message || "User updated successfully!");
          }
        }
      } catch (error) {
        console.log("Error updating user: ", error);
      }
    }

    setBuff1("");
    handleCloseDelete(); // close the backdrop
    window.location.reload;
  };

  // Checks if the string matches the regular expression format
  const checkRegex = (
    label: string,
    format: RegExp,
    userInput: string,
    match: boolean,
  ) => {
    const result = format.test(userInput); // test the regexp
    // match used to check if we want to match or not match the regexp
    if (match) {
      result
        ? setInput(label, userInput, false)
        : setInput(label, userInput, true); // True means pass/valid input, should allow it
    } else {
      result
        ? setInput(label, userInput, true)
        : setInput(label, userInput, false); // True means failed/invalid input, shouldn't allow it
    }
  };

  // Uses the label to know which form sent the request and which buffers to change
  const setInput = (label: string, userInput: string, invalid: boolean) => {
    setDisableButton(invalid);
    switch (label) {
      case "First Name":
      case "Phone Number":
      case "Street":
        setValidBuff1(!invalid);
        setBuff1(userInput);
        break;
      case "Last Name":
      case "Password":
      case "Email":
      case "City":
        setValidBuff2(!invalid);
        setBuff2(userInput);
        break;
      case "ZIP":
        setValidBuff4(!invalid);
        setBuff4(userInput);
        break;
    }
  };

  // Returns the text field for the specific setting/row
  const getTextField = (label: string) => {
    let inputField;
    switch (label) {
      case "Name": {
        inputField = (
          <>
            <TextField
              placeholder="First Name"
              variant="outlined"
              type="name"
              value={buff1}
              onChange={(e) =>
                checkRegex("First Name", nameRegex, e.target.value, false)
              }
              error={!validBuff1}
              helperText={
                !validBuff1
                  ? "Please do not use special characters or spaces"
                  : ""
              }
            />
            <TextField
              placeholder="Last Name"
              variant="outlined"
              type="name"
              value={buff2}
              onChange={(e) =>
                checkRegex("Last Name", nameRegex, e.target.value, false)
              }
              error={!validBuff2}
              helperText={
                !validBuff2
                  ? "Please do not use special characters or spaces"
                  : ""
              }
            />
          </>
        );
        break;
      }
      case "Email": {
        inputField = (
          <>
            <TextField
              placeholder="Enter Password to confirm changes"
              variant="outlined"
              type="password"
              value={buff1}
              onChange={(e) => setBuff1(e.target.value)}
            />
            <TextField
              placeholder="New Email"
              variant="outlined"
              value={buff2}
              onChange={(e) =>
                checkRegex("Email", emailRegex, e.target.value, true)
              }
              error={!validBuff2}
              helperText={!validBuff2 ? "Please enter a valid email" : ""}
            />
          </>
        );
        break;
      }
      case "Phone Number": {
        inputField = (
          <TextField
            placeholder="Phone Number"
            variant="outlined"
            value={buff1}
            onChange={(e) =>
              checkRegex("Phone Number", phoneRegex, e.target.value, true)
            }
            error={!validBuff1}
            helperText={!validBuff1 ? "Please enter a valid phone number" : ""}
          />
        );
        break;
      }
      case "Password": {
        inputField = (
          <>
            <TextField
              placeholder="Current Password"
              variant="outlined"
              type="password"
              value={""}
              onChange={(e) => setBuff1(e.target.value)}
            />
            <TextField
              placeholder="New Password"
              variant="outlined"
              type="password"
              value={buff2}
              onChange={(e) =>
                checkRegex("Password", passwordRegex, e.target.value, true)
              }
              error={!validBuff2}
              helperText={
                !validBuff2
                  ? "Password must be at least 12 characters long and include at least 2 uppercase, 2 lowercase, 2 numbers, and 2 special characters."
                  : ""
              }
            />
          </>
        );
        break;
      }
      case "Address": {
        inputField = (
          <>
            <TextField
              placeholder="Street"
              variant="outlined"
              value={userAddress.street}
              onChange={(e) =>
                checkRegex("Street", streetRegex, e.target.value, false)
              }
              error={!validBuff1}
              helperText={!validBuff1 ? "Please enter a valid street" : ""}
            />
            <TextField
              placeholder="City"
              variant="outlined"
              value={userAddress.city}
              onChange={(e) =>
                checkRegex("City", cityRegex, e.target.value, false)
              }
              error={!validBuff2}
              helperText={!validBuff2 ? "Please enter a valid city" : ""}
            />
            <InputLabel>State</InputLabel>
            <Select
              value={userAddress.state}
              onChange={(e) => setBuff3(e.target.value)}
              input={<OutlinedInput label="State" />}
            >
              {stateAbbreviations.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
            <TextField
              placeholder="ZIP Code"
              variant="outlined"
              value={userAddress.zipcode}
              onChange={(e) =>
                checkRegex("ZIP", zipRegex, e.target.value, true)
              }
              error={!validBuff4}
              helperText={!validBuff4 ? "Please enter a valid ZIP code" : ""}
            />
          </>
        );
        break;
      }
      default: {
        break;
      }
    }
    return inputField;
  };

  // Helper function that creates a row for each user setting
  // label defines the setting and value defines the user's information
  // count defines which buffer to check if all inputs are entered or not
  const settingRow = (label: string, value: string, count: number) => {
    let buffArray = [""]; // used to keep track of empty buffers
    switch (count) {
      case 1:
        buffArray = [buff1];
        break;
      case 2:
        buffArray = [buff1, buff2];
        break;
      case 4:
        buffArray = [buff1, buff2, buff3, buff4];
        break;
    }

    // Tracks if they press the edit button
    const [openUpdate, setOpenUpdate] = useState(false);
    const handleCloseUpdate = () => {
      setOpenUpdate(false); // Closes the update confirmation
      setBuff1(""); // Sets the text fields to empty
      setBuff2("");
      setBuff3("");
      setBuff4("");
      setValidBuff1(true);
      setValidBuff2(true);
      setValidBuff3(true);
      setValidBuff4(true);
      setDisableButton(true);
    };
    const handleOpenUpdate = () => {
      setOpenUpdate(true); // Brings up the update confirmation
    };

    const inputField = getTextField(label); // Create all of the input fields depending on the setting/label

    // Switch to detect which setting's backdrop opened and then change the value in the DB
    const handleUpdateUser = async () => {
      if (currentUser != null) {
        // updates settings display
        let newData = {};
        let tmpEmail = "";
        switch (label) {
          case "Name": {
            currentUser.name = buff1.trim() + " " + buff2.trim();
            newData = { name: currentUser.name };
            break;
          }
          case "Email": {
            tmpEmail = currentUser.email.trim(); // stores the old email
            currentUser.email = buff2.trim();
            newData = { email: currentUser.email };
            break;
          }
          case "Phone Number": {
            currentUser.phoneNumber = buff1;
            newData = { phoneNumber: currentUser.phoneNumber };
            break;
          }
          case "Password": {
            newData = { password: buff2 };
            break;
          }
          case "Address": {
            currentUser.address.street = buff1.trim();
            currentUser.address.city = buff2.trim();
            currentUser.address.state = buff3.trim();
            currentUser.address.zipcode = buff4.trim();
            newData = { address: userAddress };
            break;
          }
          default: {
            break;
          }
        }

        // DATABASE AND AUTH VALIDATION
        // Update the user's information in the DB
        let updateSuccessful = false;
        // Password validation section
        if (label == "Password") {
          try {
            // 2. Authenticate with Firebase directly
            const userCredential = await signInWithEmailAndPassword(
              auth,
              currentUser.email.toLowerCase().trim(),
              buff1.trim(), // cur password
            );
            const firebaseUser = userCredential.user;
            await updatePassword(firebaseUser, buff2.trim()); // updates password
          } catch (err: any) {
            console.log(err);
            setResponseMsg("Incorrect information");
          }
        } else if (label == "Email") {
          try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(
              tmpEmail.toLowerCase(),
              buff1.trim(),
            ); // confirms user
            if (user != null) {
              const result = await reauthenticateWithCredential(
                user,
                credential,
              ); // reauth user
              await verifyBeforeUpdateEmail(user, buff2.toLowerCase().trim()); // updates email after clicking link
            }
          } catch (err: any) {
            correctPassword = false;
            console.log(err);
            setResponseMsg("Incorrect information");
          }
        } else {
          try {
            // 2. Authenticate with Firebase directly
            const firebaseUser = auth.currentUser;
            if (firebaseUser != null) {
              const idToken = await firebaseUser.getIdToken();

              const response = await fetch(
                "http://localhost:3000/api/users/" + currentUser.userID,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                  },

                  body: JSON.stringify({ newData }),
                },
              );
              const result = await response.json();
              if (!response.ok) {
                setResponseMsg(result.message || "Error updating user."); // Show the backend error directly
              } else {
                setResponseMsg(
                  result.message + " Refreshing page in 5 seconds..." ||
                    "User updated successfully!",
                );
                updateSuccessful = true;
              }
            }
          } catch (error) {
            console.log("Error updating user: ", error);
          }
        }

        handleCloseUpdate(); // close the backdrop
        if (updateSuccessful) {
          await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 seconds to show the success message
          window.location.reload(); // refresh the page to show updated information
        }
      }

      setBuff1("");
      setBuff2("");
      setBuff3("");
      setBuff4("");
      handleCloseUpdate(); // close the backdrop
    };

    return (
      <>
        {/* Contains each setting to one box/row */}
        <Box
          sx={{
            borderBottom: "1px solid #f0f0f0",
            py: 1.5,
            px: 2,
            "&:last-child": { borderBottom: "none" },
          }}
        >
          {/* Each line is a label and a button */}
          <Grid
            container
            spacing={1}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            {/* Label */}
            <Grid size={{ xs: 8 }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ fontSize: "0.95rem" }}
              >
                {label}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={400}
                sx={{ color: "#666", fontSize: "0.85rem", mt: 0.5 }}
              >
                {value}
              </Typography>
            </Grid>
            {/* Button to edit setting */}
            <Grid
              size={{ xs: 4 }}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                variant="outlined"
                onClick={handleOpenUpdate}
                size="small"
                sx={{ fontSize: "0.75rem", py: 0.5, px: 1 }}
              >
                Edit
              </Button>
            </Grid>
          </Grid>
        </Box>
        {/* Popup for update confirmation */}
        <Backdrop
          sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
          open={openUpdate}
        >
          <Paper sx={{ width: "30%", padding: 10 }}>
            <Box padding={2} sx={{ textAlign: "center" }}>
              <Typography sx={{ fontWeight: "bold", fontSize: "h6.fontSize" }}>
                Confirm changes?
              </Typography>
              {inputField}
            </Box>
            <Stack
              direction="row"
              spacing={20}
              sx={{ justifyContent: "center", alignItems: "center" }}
            >
              <Button variant="contained" onClick={handleCloseUpdate}>
                Decline
              </Button>
              {/* Disables button if there is an invalid input or empty input*/}
              <Button
                variant="contained"
                disabled={
                  disableButton ||
                  (buffArray.length > 0 &&
                    buffArray.some((element) => element == ""))
                }
                onClick={handleUpdateUser}
              >
                Confirm
              </Button>
            </Stack>
          </Paper>
        </Backdrop>
      </>
    );
  };

  const settingSwitch = (label: string, value: boolean) => {
    // Special handling for toggle settings
    if (label === "Receive Texts" || label === "Receive Emails") {
      const isTexts = label === "Receive Texts";
      const currentValue = isTexts ? receiveTexts : receiveEmails;
      const setValue = isTexts ? setReceiveTexts : setReceiveEmails;
      const fieldName = isTexts ? "receiveTexts" : "receiveEmails";

      return (
        <Box
          sx={{
            borderBottom: "1px solid #f0f0f0",
            py: 1.5,
            px: 2,
            "&:last-child": { borderBottom: "none" },
          }}
        >
          <Grid
            container
            spacing={1}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Grid size={{ xs: 8 }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ fontSize: "0.95rem" }}
              >
                {label}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={400}
                sx={{ color: "#666", fontSize: "0.85rem", mt: 0.5 }}
              >
                {value ? "Enabled" : "Disabled"}
              </Typography>
            </Grid>
            <Grid
              size={{ xs: 4 }}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Switch
                checked={value}
                onChange={async (e) => {
                  const newValue = e.target.checked;
                  setValue(newValue);
                  if (currentUser) {
                    let newData = {};
                    isTexts
                      ? (currentUser.receiveTexts = newValue)
                      : (currentUser.receiveEmails = newValue);
                    isTexts
                      ? (newData = { receiveTexts: newValue })
                      : (newData = { receiveEmails: newValue });
                    try {
                      // 2. Authenticate with Firebase directly
                      const firebaseUser = auth.currentUser;
                      if (firebaseUser != null) {
                        const idToken = await firebaseUser.getIdToken();

                        const response = await fetch(
                          "http://localhost:3000/api/users/" +
                            currentUser.userID,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${idToken}`,
                            },

                            body: JSON.stringify({ newData }),
                          },
                        );
                        const result = await response.json();
                        if (!response.ok) {
                          setResponseMsg(
                            result.message || "Error updating user.",
                          ); // Show the backend error directly
                        } else {
                          setResponseMsg(
                            result.message || "Setting updated successfully!",
                          );
                        }
                      }
                    } catch (error: any) {
                      setResponseMsg(
                        error.response?.data?.message ||
                          "Error updating setting.",
                      );
                      console.log("Error updating user: ", error);
                      // Revert on error
                      setValue(!newValue);
                      isTexts
                        ? (currentUser.receiveTexts = !newValue)
                        : (currentUser.receiveEmails = !newValue);
                    }
                  }
                }}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      );
    }
  };

  return (
    <>
      <Navbar />
      {/* Main container - two column layout */}
      <Stack paddingTop={3} paddingBottom={5} paddingLeft={3} paddingRight={3}>
        <Grid container spacing={3}>
          {/* Left Column - Settings */}
          <Grid size={{ xs: 12, md: 7 }}>
            {/* Title */}
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 2 }}
            >
              Login & Security
            </Typography>
            {responseMsg && (
              <Box
                sx={{
                  backgroundColor: "#e3f2fd",
                  color: "#1976d2",
                  p: 1.5,
                  borderRadius: 1,
                  mb: 2,
                  textAlign: "center",
                  fontSize: "0.9rem",
                }}
              >
                {responseMsg}
              </Box>
            )}
            {/* Setting container */}
            <Box border={1} borderRadius={2} sx={{ borderColor: "#e0e0e0" }}>
              <Stack>
                {settingRow("Name", currentUser?.name ?? "", 2)}
                {settingRow("Email", currentUser?.email ?? "", 2)}
                {settingRow("Phone Number", currentUser?.phoneNumber ?? "", 1)}
                {settingRow("Password", "***********", 2)}
                {settingRow("Address", fullAddress ?? "", 4)}
                {settingSwitch(
                  "Receive Texts",
                  currentUser?.receiveTexts ?? false,
                )}
                {settingSwitch(
                  "Receive Emails",
                  currentUser?.receiveEmails ?? false,
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} sx={{ marginTop: 2 }}>
              <Button variant="contained" onClick={handleLogout} size="small">
                Log Out
              </Button>
              <Button
                variant="outlined"
                onClick={handleOpenDelete}
                size="small"
              >
                Delete Account
              </Button>
            </Stack>
          </Grid>

          {/* Right Column - Upcoming Appointments */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 2 }}
            >
              Upcoming Appointments
            </Typography>
            {loadingAppointments ? (
              <Typography sx={{ color: "#999" }}>Loading...</Typography>
            ) : appointments.length === 0 ? (
              <Card sx={{ backgroundColor: "#f5f5f5" }}>
                <CardContent>
                  <Typography sx={{ color: "#999", textAlign: "center" }}>
                    No upcoming appointments
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Stack spacing={1.5}>
                {appointments.map((apt, index) => (
                  <Card
                    key={index}
                    sx={{
                      backgroundColor: "#fafafa",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <CardContent
                      sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}
                    >
                      <Stack spacing={0.5}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {apt.generatorModel || "Generator Service"}
                          </Typography>
                          <Chip
                            label={apt.status || "Scheduled"}
                            size="small"
                            sx={{
                              backgroundColor:
                                apt.status === "Cancelled"
                                  ? "#ffebee"
                                  : apt.status === "Completed"
                                    ? "#e8f5e9"
                                    : "#e3f2fd",
                              color:
                                apt.status === "Cancelled"
                                  ? "#c62828"
                                  : apt.status === "Completed"
                                    ? "#2e7d32"
                                    : "#1976d2",
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          {new Date(apt.appointmentDateTime).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                          {apt.travelCost !== undefined && apt.travelCost != null && (
                            <Typography variant="body2" sx={{ color: "#321a6cff", fontWeight : 600}}>
                             💰 Travel Cost : ${apt.travelCost.toFixed(2)}
                            </Typography>
                          )}
                        </Typography>
                        {apt.address && (
                          <Typography
                            variant="body2"
                            sx={{ color: "#999", fontSize: "0.85rem" }}
                          >
                            📍 {apt.address}
                          </Typography>
                        )}
                        {apt.phone && (
                          <Typography
                            variant="body2"
                            sx={{ color: "#999", fontSize: "0.85rem" }}
                          >
                            📞 {apt.phone}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Stack>

      {/* Delete Account Confirmation Dialog */}
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={openDelete}
      >
        <Paper sx={{ width: "30%", padding: 10 }}>
          <Box padding={2} sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: "bold", fontSize: "h6.fontSize" }}>
              Delete Account?
            </Typography>
            <TextField
              placeholder="Password"
              variant="outlined"
              type="password"
              value={buff1}
              onChange={(e) => setBuff1(e.target.value)}
            />
          </Box>
          <Stack
            direction="row"
            spacing={20}
            sx={{ justifyContent: "center", alignItems: "center" }}
          >
            <Button variant="contained" onClick={handleCloseDelete}>
              Decline
            </Button>
            {/* Disables button if there is an invalid input or empty input*/}
            <Button
              variant="contained"
              disabled={disableDeleteButton && buff1 == ""}
              onClick={handleDeleteUser}
            >
              Confirm
            </Button>
          </Stack>
        </Paper>
      </Backdrop>
      <Footer />
    </>
  );
};

export default UserSettings;