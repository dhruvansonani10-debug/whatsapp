import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLoginStore from '../../../store/useLoginStore';
import countries from '../../../utils/countries';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useUserStore from '../../../store/useUserStore';
import useThemeStore from '../../../store/themeStore';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Mail, Phone, Camera } from 'lucide-react';

// Validation schema
const loginValidationSchema = yup.object().shape({
  phoneNumber: yup.string()
    .nullable()
    .notRequired()
    .test('is-phone', 'invalid phone number', value => {
      if (!value) return true;
      return /^\d+$/.test(value);
    })
    .transform((value, originalValue) => originalValue?.trim() === "" ? null : value),
  email: yup.string()
    .nullable()
    .notRequired()
    .email("invalid email")
    .transform((value, originalValue) => originalValue?.trim() === "" ? null : value)
}).test("at-least-one", "either email or phone number is required", function (value) {
  return !!(value.phoneNumber || value.email);
});

const otpValidationSchema = yup.object().shape({
  otp: yup.string().length(6, "otp must be 6 digits").required("otp is required")
});

const profileValidationSchema = yup.object().shape({
  username: yup.string().required("username is required").min(3, "username must be at least 3 characters").max(30, "username must be at most 30 characters"),
  agreed: yup.boolean().oneOf([true], "you must agree to the terms"),
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
  const { step, setStep, userPhoneData, setUserPhoneData, resetLoginState } = useLoginStore();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'email'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const { theme, setTheme } = useThemeStore();

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors }
  } = useForm({
    resolver: yupResolver(loginValidationSchema)
  });

  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValue
  } = useForm({
    resolver: yupResolver(otpValidationSchema)
  });

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm({
    resolver: yupResolver(profileValidationSchema)
  });

  const onLoginSubmit = (data) => {
    setUserPhoneData({ ...data, countryCode: loginMethod === 'phone' ? selectedCountry.dialCode : null });
    setStep(2);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpValue('otp', newOtp.join(''));
    if (value !== '' && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const onOtpSubmit = (data) => {
    setStep(3);
  };

  const onProfileSubmit = (data) => {
    setUser({ username: data.username, avatar: selectedAvatar, phone: userPhoneData?.phoneNumber, email: userPhoneData?.email });
    navigate('/');
  };

  const ProgressBar = () => (
    <div className={`w-full rounded-full h-1.5 mb-8 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
      <div 
        className="bg-[#00a884] h-1.5 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${(step / 3) * 100}%` }}
      ></div>
    </div>
  );

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#111b21] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]'}`}>
      <motion.div 
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{duration:0.4}} 
        className={`p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden ${theme === 'dark' ? "bg-[#202c33]" : "bg-white"}`} 
      >
        <ProgressBar />
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold mb-2">Welcome to WhatsApp</h1>
                <p className="text-sm opacity-70">Enter your phone number or email to get started</p>
              </div>

              <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-[#111b21] rounded-lg">
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center ${loginMethod === 'phone' ? 'bg-white dark:bg-[#202c33] shadow' : 'opacity-70'}`}
                >
                  <Phone className="inline-block w-4 h-4 mr-2" /> Phone
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center ${loginMethod === 'email' ? 'bg-white dark:bg-[#202c33] shadow' : 'opacity-70'}`}
                >
                  <Mail className="inline-block w-4 h-4 mr-2" /> Email
                </button>
              </div>

              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-6">
                {loginMethod === 'phone' ? (
                  <div className="space-y-4">
                    <div>
                      <select 
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#00a884] outline-none transition-all ${theme === 'dark' ? 'bg-[#111b21] border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                        value={selectedCountry.alpha2}
                        onChange={e => setSelectedCountry(countries.find(c => c.alpha2 === e.target.value) || countries[0])}
                      >
                        {countries.map(c => (
                          <option key={c.alpha2} value={c.alpha2}>{c.name} ({c.dialCode})</option>
                        ))}
                      </select>
                    </div>
                    <div className={`flex rounded-lg border focus-within:ring-2 focus-within:ring-[#00a884] transition-all overflow-hidden ${theme === 'dark' ? 'border-gray-700 bg-[#111b21]' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="p-3 border-r border-gray-200 dark:border-gray-700 text-gray-500 min-w-[60px] text-center">
                        {selectedCountry.dialCode}
                      </div>
                      <input 
                        type="text"
                        placeholder="Phone number"
                        className="w-full p-3 bg-transparent outline-none"
                        {...loginRegister('phoneNumber')}
                      />
                    </div>
                    {loginErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{loginErrors.phoneNumber.message}</p>}
                  </div>
                ) : (
                  <div>
                    <input 
                      type="email"
                      placeholder="Email address"
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#00a884] outline-none transition-all ${theme === 'dark' ? 'bg-[#111b21] border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                      {...loginRegister('email')}
                    />
                    {loginErrors.email && <p className="text-red-500 text-xs mt-1">{loginErrors.email.message}</p>}
                  </div>
                )}
                
                {Object.keys(loginErrors).length > 0 && !loginErrors.phoneNumber && !loginErrors.email && (
                  <p className="text-red-500 text-xs text-center">Please provide a valid contact method</p>
                )}

                <button 
                  type="submit"
                  className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold mb-2">Verify your number</h1>
                <p className="text-sm opacity-70">
                  Waiting to automatically detect an SMS sent to<br/>
                  <span className="font-bold">{userPhoneData?.countryCode} {userPhoneData?.phoneNumber || userPhoneData?.email}</span>
                  <button onClick={() => setStep(1)} className="text-[#00a884] ml-2 hover:underline">Wrong number?</button>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-8">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && digit === '' && index > 0) {
                          document.getElementById(`otp-${index - 1}`).focus();
                        }
                      }}
                      className={`w-12 h-14 text-center text-xl font-semibold rounded-lg border focus:ring-2 focus:ring-[#00a884] outline-none transition-all ${theme === 'dark' ? 'bg-[#111b21] border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                    />
                  ))}
                </div>
                {otpErrors.otp && <p className="text-red-500 text-xs text-center">{otpErrors.otp.message}</p>}

                <button 
                  type="submit"
                  className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Verify <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold mb-2">Profile info</h1>
                <p className="text-sm opacity-70">Please provide your name and an optional profile photo</p>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group cursor-pointer">
                    <img 
                      src={selectedAvatar} 
                      alt="Avatar" 
                      className={`w-24 h-24 rounded-full border-4 object-cover ${theme === 'dark' ? 'border-[#111b21]' : 'border-white shadow-sm'}`}
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 overflow-x-auto max-w-full pb-2">
                    {avatars.map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${selectedAvatar === avatar ? 'border-[#00a884] scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                      >
                        <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full rounded-full" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input 
                    type="text"
                    placeholder="Type your name here"
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#00a884] outline-none transition-all ${theme === 'dark' ? 'bg-[#111b21] border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                    {...profileRegister('username')}
                  />
                  {profileErrors.username && <p className="text-red-500 text-xs mt-1">{profileErrors.username.message}</p>}
                </div>

                <div className="flex items-start gap-2">
                  <input 
                    type="checkbox" 
                    id="agreed"
                    className="mt-1 w-4 h-4 text-[#00a884] rounded border-gray-300 focus:ring-[#00a884]"
                    {...profileRegister('agreed')}
                  />
                  <label htmlFor="agreed" className="text-xs opacity-70">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>
                {profileErrors.agreed && <p className="text-red-500 text-xs">{profileErrors.agreed.message}</p>}

                <button 
                  type="submit"
                  className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Complete Setup
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Login;