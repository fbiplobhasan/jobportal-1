import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const useAxiosSecure = () => {
  const { signOutUser } = useAuth(); // হুকের ভেতরে কল করুন
  const navigate = useNavigate();

  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000", // baseURL ঠিক করুন
    withCredentials: true,
  });

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response, // সফল রেসপন্স
      (error) => {
        console.log("Error caught in interceptor:", error);

        // Error এর স্ট্যাটাস চেক করুন
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log("Need to log out the user");
          signOutUser()
            .then(() => {
              console.log("Logged out user");
              navigate("/signIn"); // লগআউট হলে সাইন ইন পেজে রিডিরেক্ট
            })
            .catch((logoutError) => console.error("Error during logout:", logoutError));
        }

        return Promise.reject(error);
      }
    );

    return () => {
      // ক্লিনআপ: ইন্টারসেপ্টর অপসারণ করুন
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [signOutUser, navigate]); // ডিপেন্ডেন্সি অ্যারে আপডেট করুন

  return axiosInstance; // ইন্সট্যান্স রিটার্ন করুন
};

export default useAxiosSecure;
