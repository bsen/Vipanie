import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./Firebase/config";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BackendUrl } from "../config";

const Login = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user.email) {
      setEmail(result.user.email);
      setPhotoURL(result.user.photoURL ? result.user.photoURL : "");
    }
  };

  useEffect(() => {
    handleAuth();
  }, [email]);

  const handleAuth = async () => {
    const response = await axios.post(`${BackendUrl}/api/shop/auth`, {
      email,
      photoURL,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      navigate("/home");
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/home");
    }
  }, [token, navigate]);

  return (
    <main className="container mx-auto px-4 py-8 h-screen flex items-center justify-center">
      <div className="bg-neutral-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 w-full max-w-md">
        <div className="p-6 bg-indigo-50">
          <div className="flex flex-col items-center">
            <img src="/store.png" className="w-20" alt="Vipanie Store" />
          </div>

          <p className="text-gray-600 mt-0 mb-8 text-center text-xl">
            Login to start selling your products online
          </p>
          <button
            onClick={handleGoogle}
            className="w-full bg-indigo-600 text-white rounded-full py-2 px-4 hover:bg-indigo-700 transition duration-300 flex items-center justify-center gap-2"
          >
            <img src="/google.png" className="h-6 w-6" alt="Google" />
            <span>Login with Google</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default Login;
