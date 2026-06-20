import React from "react";
import useLoginStore from "../../../store/useLoginStore.js";
import countries from "../../../utils/countries.js";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../../store/useUserStore.js";
import useThemeStore from "../../../store/themeStore.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, updateMotionValuesFromProps } from "framer-motion";
import { FaChevronDown, FaUser, FaWhatsapp, FaSpinner,FaArrowLeft, FaPlus } from "react-icons/fa";
import { sendOtp, verifyOtp, updateUserProfile } from "../../services/user.service.js";
import { toast } from "react-toastify";

// Validation schema
const loginValidationSchema = Yup.object()
  .shape({
    phoneNumber: Yup.string()
      .nullable()
      .notRequired()
      .matches(/^[0-9]+$/, "Only numbers are allowed")
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value,
      ),
    email: Yup.string()
      .email("Invalid email")
      .nullable()
      .notRequired()
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value,
      ),
  })
  .test(
    "at-least-one",
    "Either email or phone number is required",
    function (value) {
      return !!(value.phoneNumber || value.email);
    },
  );

const otpValidationSchema = Yup.object().shape({
  otp: Yup.string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

const profileValidationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required").min(3),
  agreed: Yup.boolean().oneOf([true], "you must agree to the terms"),
});

const avatars = [
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe",
];

function Login() {
  const { step, setStep, setUserPhoneData, userPhoneData, resetLoginState } =
    useLoginStore();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectCountry, setSelectCountry] = useState(
    countries[0] || { flag: "🇮🇳", dialCode: "+91", name: "India" },
  );
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useThemeStore();

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    watch,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });
  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors = {} }, 
  } = useForm();

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    watch: watchProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileValidationSchema),
  });

  const filterCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm),
  );

  const onLoginSubmit = async () => {
    try {
      setLoading(true);
      if (email) {
        const response = await sendOtp(null, null, email);
        if (response.status === "success") {
          toast.info("OTP is send to your email");
          setUserPhoneData({ email });
          setStep(2);
        }
      } else {
        const response = await sendOtp(
          phoneNumber,
          selectCountry.dialCode
        );
        if (response.status === "success") {
          toast.info("OTP is send to your phone number");
          setUserPhoneData({
            phoneNumber,
            phoneSuffix: selectCountry.dialCode,
          });
          setStep(2);
        }
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async () => {
  try {
    setLoading(true);
    setError(null); // જૂની એરર ક્લિયર કરો
    
    if (!userPhoneData) {
      throw new Error("Phone or email data is missing");
    }
    
    const otpString = otp.join("");
    let response;
    
    // 🟢 સુધારેલો ક્રમ: (phoneNumber, phoneSuffix, email, otp)
    if (userPhoneData?.email) {
      // ફોન નંબર અને સફિક્સ null, ત્રીજો ઈમેલ, ચોથો OTP
      response = await verifyOtp(null, null, userPhoneData.email, otpString);
    } else {
      // પહેલો ફોન, બીજો સફિક્સ, ત્રીજો ઈમેલ null, ચોથો OTP
      response = await verifyOtp(
        userPhoneData.phoneNumber,
        userPhoneData.phoneSuffix,
        null,
        otpString
      );
    }

    if (response.status === "success") {
      toast.success("OTP is verified successfully");
      
      // 🟢 બેકએન્ડ રિસ્પોન્સ હેન્ડલર મુજબ યુઝર ડેટા મેળવો
      const user = response.data; // જો ડેટા સીધો response.data માં હોય તો
      
      if (user?.username && user?.profilePicture) {
        setUser(user);
        toast.success("Welcome back to WhatsApp");
        navigate("/");
        resetLoginState();
      } else {
        setStep(3); // જો નવો યુઝર હશે તો જ સ્ટેપ ૩ પર જશે
      }
    }
  } catch (error) {
    console.log(error);
    setError(error.response?.data?.message || error.message);
  } finally {
    setLoading(false);
  }
};

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  };


  

  const onProfileSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("agreed", data.agreed);
      if (profilePictureFile) {
        formData.append("media", profilePictureFile);
      } else {
        formData.append("profilePicture", selectedAvatar);
      }
      await updateUserProfile(formData);
      toast.success("welcome back to Whatsapp");
      navigate("/");
      resetLoginState();
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  }

  const ProgressBar = () => (
    <div
      className={`w-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2.5 mb-6 `}
    >
      <div
        className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${(step / 3) * 100}% ` }}
      ></div>
    </div>
  );

  const handleBack = () => {
    setStep(1);
    setUserPhoneData(null);
    setOtp(["", "", "", "", "", ""]);
    setError(null);
  };

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-slate-900" : "bg-gradient-to-br from-teal-100 via-slate-50 to-sky-100"} flex items-center justify-center p-4 overflow-hidden`}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-white"} p-6 md:p-8 rounded-lg shadow-2xl w-full max-w-md relative z-10`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.2,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <FaWhatsapp className="w-16 h-16 text-white m-auto " />
        </motion.div>

        <h1
          className={`text-3xl font-bold text-center mb-6 ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          WhatsApp Login
        </h1>

        <ProgressBar />

        {error && (
          <p className="text-red-500 text-center mb-4 animate-pulse">{error}</p>
        )}

        {step === 1 && (
          <form
            onSubmit={handleLoginSubmit(onLoginSubmit)}
            className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-4`}
          >
            <p className="mb-6 font-medium text-sm md:text-base">
              Enter your phone number to receive an OTP
            </p>

            {/* Phone Input Box Block */}
            <div className="relative mb-4">
              <div className="flex">
                <div className="relative w-1/3">
                  <button
                    type="button"
                    className={`w-full justify-between z-10 inline-flex items-center py-2.5 px-3 text-sm font-medium text-center ${theme === "dark" ? "text-white bg-gray-700 border-gray-600" : "text-gray-700 bg-gray-50 border-gray-300"} border rounded-s-md hover:bg-gray-200 focus:outline-none`}
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span className="truncate">
                      {selectCountry.flag} {selectCountry.dialCode}
                    </span>
                    <FaChevronDown className="ml-2 text-xs flex-shrink-0" />
                  </button>

                  {showDropdown && (
                    <div
                      className={`absolute left-0 z-20 w-64 mt-1 ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"} border rounded-md shadow-lg max-h-60 overflow-auto`}
                    >
                      <div
                        className={`sticky top-0 ${theme === "dark" ? "bg-gray-700" : "bg-white"} p-2 z-10`}
                      >
                        <input
                          type="text"
                          placeholder="Search Countries..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`w-full px-3 py-1 border ${theme === "dark" ? "bg-gray-600 text-white border-gray-500" : "bg-white border-gray-300 text-gray-900"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500`}
                        />
                      </div>
                      {filterCountries.map((country) => (
                        <button
                          key={country.alpha2 || country.name}
                          type="button"
                          className={`w-full text-left px-3 py-2 text-sm ${theme === "dark" ? "hover:bg-gray-600 text-white" : "hover:bg-gray-100 text-gray-900"} focus:outline-none`}
                          onClick={() => {
                            setSelectCountry(country);
                            setShowDropdown(false);
                          }}
                        >
                          {country.flag} ({country.dialCode}) {country.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  {...loginRegister("phoneNumber")}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone Number"
                  className={`w-2/3 px-4 py-2 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} border-y border-e rounded-e-md focus:outline-none focus:ring-2 focus:ring-green-500 ${loginErrors.phoneNumber && "border-red-500"}`}
                />
              </div>
              {loginErrors.phoneNumber && (
                <p className="text-red-500 text-left text-xs mt-1 animate-pulse">
                  {loginErrors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Divider with "or" */}
            <div className="flex items-center my-5">
              <div className="flex-grow h-px bg-gray-200"></div>
              <span className="mx-3 text-gray-400 text-sm font-normal">or</span>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>

            {/* Email Input Box Container */}
            <div className="mb-6">
              <div
                className={`flex items-center border rounded-md px-3 py-2 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} focus-within:ring-2 focus-within:ring-green-500 ${loginErrors.email && "border-red-500"}`}
              >
                <FaUser className="text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="email"
                  {...loginRegister("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className={`w-full bg-transparent focus:outline-none ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                />
              </div>
              {loginErrors.email && (
                <p className="text-red-500 text-left text-xs mt-1 animate-pulse">
                  {loginErrors.email.message}
                </p>
              )}
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2.5 font-medium rounded-md hover:bg-green-600 transition flex items-center justify-center"
            >
              {loading ? <FaSpinner /> : "send OTP"}
            </button>
          </form>
        )}
        {step === 2 && (
  <form
    onSubmit={handleOtpSubmit(onOtpSubmit)}
    className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-4`}
  >
    <p
      className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-6 text-sm md:text-base`}
    >
      please enter 6-digit OTP send to your{" "}
      {userPhoneData ? userPhoneData.phoneSuffix : "Email"} {""}
      {userPhoneData.phoneNumber && userPhoneData?.phoneNumber}
    </p>

    <div className="flex justify-between gap-2 mb-6">
      {otp.map((digit, index) => (
        <input
          key={index}
          id={`otp-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          className={`w-12 h-14 text-center text-xl border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${otpErrors.otp ? "border-red-500" : ""}`}
        />
      ))}
    </div>

    {otpErrors.otp && (
      <p className="text-red-500 text-left text-xs mb-4 animate-pulse">
        {otpErrors.otp.message}
      </p>
    )}

    <div className="flex flex-col gap-3">
      <button
        type="submit"
        className="w-full bg-green-500 text-white py-3 font-semibold rounded-lg hover:bg-green-600 transition flex items-center justify-center text-base"
      >
        {loading ? <FaSpinner className="animate-spin" /> : "Verify OTP"}
      </button>
      
      <button 
        type="button"
        onClick={handleBack}
        className={`w-full py-3 rounded-lg font-medium text-sm transition flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600': 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        <FaArrowLeft className="mr-2 text-xs"/>
        Wrong number ? go back
      </button>
    </div>
  </form>
)}
        {step === 3 && (
  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="flex flex-col items-center w-full">
    {/* Profile Picture Preview */}
    <div className="relative w-24 h-24 mb-4 flex-shrink-0">
      <img 
        src={profilePicture || selectedAvatar} 
        alt="profile" 
        className="w-full h-full rounded-full object-cover border-2 border-gray-100 shadow-sm" 
      />
      <label 
        htmlFor="profile-picture" 
        className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition duration-300 shadow-md z-10"
      >
        <FaPlus className="w-3 h-3"/>
      </label>
      <input 
        type="file" 
        id="profile-picture" 
        accept="image/*" 
        onChange={handleFileChange} 
        className="hidden" 
      />
    </div>

    {/* Avatar Label */}
    <p className={`text-sm font-medium mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}> 
      Choose an avatar 
    </p>

    {/* Avatar Selection List */}
    <div className="flex flex-wrap justify-center gap-3 mb-6 w-full px-2">
      {avatars.map((avatar, index) => (
        <img 
          src={avatar} 
          alt={`avatar-${index+1}`} 
          key={index} 
          onClick={() => {
            setSelectedAvatar(avatar);
            setProfilePicture(null); // અવતાર ક્લિક થાય ત્યારે અપલોડ કરેલી ઈમેજ ક્લિયર થશે
          }}
          className={`w-12 h-12 rounded-full cursor-pointer transition duration-200 ease-in-out transform hover:scale-110 object-cover ${
            selectedAvatar === avatar && !profilePicture
              ? "ring-2 ring-green-500 ring-offset-2 scale-105" 
              : ""
          }`} 
        />
      ))}
    </div>

    {/* Username Input Container */}
    <div className="relative w-full mb-1">
      <FaUser 
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400':'text-gray-400'}`} 
      />
      <input
        type="text"
        {...profileRegister("username")}
        placeholder="Username"
        className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
          theme === 'dark' 
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
        }`}
      />
    </div>
    {profileErrors.username && (
      <p className="text-red-500 text-left w-full text-xs mb-2 animate-pulse pl-1">
        {profileErrors.username.message}
      </p>
    )}

    {/* Terms & Conditions Checkbox */}
    <div className="flex items-center space-x-2 w-full mt-3 mb-1 pl-1">
      <input
        {...profileRegister('agreed')}
        type="checkbox"
        id="terms"
        className={`w-4 h-4 rounded cursor-pointer accent-green-500 ${
          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
        } focus:ring-green-500`}
      />
      <label htmlFor="terms" className={`text-sm cursor-pointer select-none ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        I agree to the <a href="#" className="text-red-500 hover:underline font-medium transition ml-0.5">Terms and Conditions</a>
      </label>
    </div>
    {profileErrors.agreed && (
      <p className="text-red-500 text-left w-full text-xs mb-2 animate-pulse pl-1">
        {profileErrors.agreed.message}
      </p>  
    )}

    {/* Submit Button */}
    <button
      type="submit"
      disabled={!watchProfile("agreed") || loading}
      className={`w-full py-3 rounded-md flex items-center justify-center mt-4 font-semibold text-base transition duration-200 ${
        !watchProfile("agreed") || loading 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
          : 'bg-green-500 text-white hover:bg-green-600 active:scale-[0.99] shadow-md shadow-green-500/20'
      }`}
    >
      {loading ? <FaSpinner className="animate-spin text-xl" /> : "Create Profile"}
    </button>
  </form>
)}
      </motion.div>
    </div>
  );
}

export default Login;
