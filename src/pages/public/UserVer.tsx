import { Box, Button } from "@mui/material";
import { applyActionCode, checkActionCode, type Auth } from "firebase/auth";
import { auth } from "../../firebase"; 
import { useEffect, useState } from "react";


const UserVer = () => {
  const [message, setMessage] = useState("N/A");

  // Check URL for params
  const getParameterByName = (label: string) => {
      let params = new URLSearchParams(document.location.search);      
      return params.get(label);
  }

  // Get the action to complete.
  const mode = getParameterByName('mode');
  // Get the one-time code from the query parameter.
  const actionCode = getParameterByName('oobCode');
  // (Optional) Get the continue URL from the query parameter if available.
  const continueUrl = getParameterByName('continueUrl');
  // (Optional) Get the language code if available.
  const lang = getParameterByName('lang');


  // Returns UI for user wanting to update their email
  const handleVerifyAndChangeEmail = (auth: Auth, actionCode: string, continueUrl: string, lang: string) => {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    useEffect(() => {
      // Check metadata about the code sent
      checkActionCode(auth, actionCode).then(async (res) => {
        let oldEmail = res.data.previousEmail;
        let newData = { email: res.data.email };
        await applyActionCode(auth, actionCode).then(async (resp) => {
          // Email address has been verified and changed in Firebase.
          // Change email in mongodb
          await fetch("http://localhost:3000/api/users/ver/" + oldEmail, {
            method: "PUT",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({newData}),  
          }).then (async (ures) => {
              const tmp = await ures.json();
              setMessage(tmp.message);
            });
          //const result = await response.json();
          //console.log(result.message);
          // TODO: Display a confirmation message to the user.
          // You could also provide the user with a link back to the app.

          // TODO: If a continue URL is available, display a button which on
          // click redirects the user back to the app via continueUrl with
          // additional state determined from that URL's parameters.
        }).catch((error) => {
            // Code is invalid or expired. Ask the user to verify their email address
            // again.
            setMessage(error.message);
            console.log(error);
          })
      }).catch((error) => {
          // Code is invalid or expired. Ask the user to verify their email address
          // again.
          setMessage(error.message);
          console.log(error);
        });
    }, []);


    // Build UI
    return(
      <Box>{message}</Box>
    )
  }

  // Returns UI for user wanting to update their email
  const handleVerifyEmail = (auth: Auth, actionCode: string, continueUrl: string, lang: string) => {
    useEffect(() => {
      // check actionCode to get verified email
      checkActionCode(auth, actionCode).then(async (res) => {
        let email = res.data.email;
        // apply action code
          applyActionCode(auth, actionCode).then(async (resp) => {
          setMessage("Success! You can now login as " + email);
          console.log("Success");
        }).catch((error) => {
          // Code is invalid or expired. Ask the user to verify their email address again. (applyActionCode)
          setMessage(error.message);
          console.log(error);
        });;
      }).catch((error) => {
        // Code is invalid or expired. Ask the user to verify their email address again. (checkActionCode)
        setMessage(error.message);
        console.log(error);
      });
    }, [])
        
    
    return(
      <>
        <Box>{message}</Box>
        <Button href={continueUrl} variant="contained"> Home </Button>
      </>
      
    )
  }



  // Handle the user management action.
  // VERIFY_AND_CHANGE_EMAIL
  // TODO: PASSWORD_RESET, VERIFY_EMAIL
  let UI;
  switch (mode) {
    case 'verifyAndChangeEmail':
      // Display update email verification handler and UI.
      UI = handleVerifyAndChangeEmail(auth, actionCode || "", continueUrl || "http://localhost:5173/", lang || "en");
      break;
    case 'resetPassword':
      // Display reset password verification handler and UI
      break;
    case 'verifyEmail':
      // Display verify email verification handler and UI
      UI = handleVerifyEmail(auth, actionCode || "", continueUrl || "http://localhost:5173/", lang || "en");
      break; 
    default:
      break;
  }

  
  // UI changes depending on the mode
  return (
    <>
      {UI}
    </>
  )
}


export default UserVer;