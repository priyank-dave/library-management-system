import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
export default function Login() {
  const handleSuccess = async (response) => {
    const token = response.credential;
    const res = await axios.post("http://localhost:8000/api/auth/google/", {
      token,
    });

    // Store JWT token
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);

    console.log("User authenticated:", res.data.user);
  };

  return (
    <GoogleOAuthProvider clientId="1039262952226-dbopsip4r1d55gldlhvuok27bn83cbfm.apps.googleusercontent.com">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error("Google Login Failed")}
      />
    </GoogleOAuthProvider>
  );
}
