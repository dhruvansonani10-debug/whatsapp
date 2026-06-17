import React from 'react';
import useLoginStore from '../../../store/useLoginStore.js';
import countries from '../../../utils/countries.js';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../../store/useUserStore.js';
import useThemeStore from '../../../store/themeStore.js';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FaChevronDown, FaUser, FaWhatsapp, FaSpinner } from 'react-icons/fa';

// Validation schema
const loginValidationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .nullable()
    .notRequired()
    .matches(/^[0-9]+$/, "Only numbers are allowed")
    .transform((value, originalValue) => (originalValue.trim() === "" ? null : value)),
  email: Yup.string()
    .email("Invalid email")
    .nullable()
    .notRequired()
    .transform((value, originalValue) => (originalValue.trim() === "" ? null : value)),
}).test("at-least-one", "Either email or phone number is required", function (value) {
  return !!(value.phoneNumber || value.email);
});

const otpValidationSchema = Yup.object().shape({
  otp: Yup.string().length(6, "OTP must be 6 digits").required("OTP is required"),
});

const profileValidationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required").min(3),
  agreed: Yup.boolean().oneOf([true], "you must agree to the terms"),
});

const avatars = [
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
];

function Login() {
  const { step, setStep, setUserPhoneData, userPhoneData, resetLoginState } = useLoginStore();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectCountry, setSelectCountry] = useState(countries[0] || { flag: "🇮🇳", dialCode: "+91", name: "India" });
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

  const { register: loginRegister, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  const filterCountries = countries.filter(
    (country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()) || country.dialCode.includes(searchTerm)
  );

  const ProgressBar = () => (
    <div className={`w-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2.5 mb-6 `}>
      <div className='bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out' style={{ width: `${(step / 3) * 100}% ` }}></div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-900" : "bg-gradient-to-br from-teal-100 via-slate-50 to-sky-100"} flex items-center justify-center p-4 overflow-hidden`}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-white"} p-6 md:p-8 rounded-lg shadow-2xl w-full max-w-md relative z-10`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
          className='w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center'
        >
          <FaWhatsapp className="w-16 h-16 text-white m-auto " />
        </motion.div>
        
        <h1 className={`text-3xl font-bold text-center mb-6 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>WhatsApp Login</h1>

        <ProgressBar />

        {error && <p className='text-red-500 text-center mb-4 animate-pulse'>{error}</p>}

        {step === 1 && (
          <form onSubmit={handleLoginSubmit((data) => console.log(data))} className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-4`}>
            <p className='mb-6 font-medium text-sm md:text-base'>
              Enter your phone number to receive an OTP
            </p>
            
            {/* Phone Input Box Block */}
            <div className='relative mb-4'>
              <div className='flex'>
                <div className='relative w-1/3'>
                  <button
                    type='button'
                    className={`w-full justify-between z-10 inline-flex items-center py-2.5 px-3 text-sm font-medium text-center ${theme === "dark" ? "text-white bg-gray-700 border-gray-600" : "text-gray-700 bg-gray-50 border-gray-300"} border rounded-s-md hover:bg-gray-200 focus:outline-none`}
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span className="truncate">
                      {selectCountry.flag} {selectCountry.dialCode}
                    </span>
                    <FaChevronDown className='ml-2 text-xs flex-shrink-0' />
                  </button>
                  
                  {showDropdown && (
                    <div className={`absolute left-0 z-20 w-64 mt-1 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-md shadow-lg max-h-60 overflow-auto`}>
                      <div className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-2 z-10`}>
                        <input 
                          type="text" 
                          placeholder='Search Countries...' 
                          value={searchTerm} 
                          onChange={(e) => setSearchTerm(e.target.value)} 
                          className={`w-full px-3 py-1 border ${theme === "dark" ? "bg-gray-600 text-white border-gray-500" : "bg-white border-gray-300 text-gray-900"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500`} 
                        />
                      </div>
                      {filterCountries.map((country) => (
                        <button 
                          key={country.alpha2 || country.name} 
                          type='button' 
                          className={`w-full text-left px-3 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-900'} focus:outline-none`}
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
                  {...loginRegister('phoneNumber')}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone Number"
                  className={`w-2/3 px-4 py-2 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} border-y border-e rounded-e-md focus:outline-none focus:ring-2 focus:ring-green-500 ${loginErrors.phoneNumber && 'border-red-500'}`}
                />
              </div>
              {loginErrors.phoneNumber && <p className='text-red-500 text-left text-xs mt-1 animate-pulse'>{loginErrors.phoneNumber.message}</p>}
            </div>

            {/* Divider with "or" */}
            <div className='flex items-center my-5'>
              <div className='flex-grow h-px bg-gray-200'></div>
              <span className='mx-3 text-gray-400 text-sm font-normal'>or</span>
              <div className='flex-grow h-px bg-gray-200'></div>
            </div>

            {/* Email Input Box Container */}
            <div className="mb-6">
              <div className={`flex items-center border rounded-md px-3 py-2 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} focus-within:ring-2 focus-within:ring-green-500 ${loginErrors.email && 'border-red-500'}`}>
                <FaUser className='text-gray-400 mr-3 flex-shrink-0' />
                <input 
                  type="email"
                  {...loginRegister('email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Email (optional)'
                  className={`w-full bg-transparent focus:outline-none ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                />
              </div>
              {loginErrors.email && <p className='text-red-500 text-left text-xs mt-1 animate-pulse'>{loginErrors.email.message}</p>}
            </div>

            {/* Action Submit Button */}
            <button type='submit' className='w-full bg-green-500 text-white py-2.5 font-medium rounded-md hover:bg-green-600 transition flex items-center justify-center'>
              { loading ? <FaSpinner  /> : "send OTP"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default Login;