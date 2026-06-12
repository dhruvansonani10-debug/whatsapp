import React from 'react'
import useLoginStore from '../../../store/useLoginStore'
import { countries } from '../../../lib/countries';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useUserStore from '../../../store/useUserStore';

//validation schema
const loginValidationSchema = yup.object().shape({
  phoneNumber:yup.string().nullable().notRequired().matches(/^\d+$/,"invalid phone number").transform((value,originalValue) => {originalValue.trim()=== "" ? null:value}),
  email:yup.string().nullable().notRequired().email("invalid email").transform((value,originalValue) => {originalValue.trim()=== "" ? null:value})
  }).test( "at-least-one","either email or phone number is required", function(value){
    return !!(value.phoneNumber || value.email);
})

const otpValidationSchema = yup.object().shape({
  otp:yup.string().length(6,"otp must be 6 digits").required("otp is required")
})

const profileValidationSchema = yup.object().shape({
  username:yup.string().required("username is required").min(3,"username must be at least 3 characters").max(30,"username must be at most 30 characters"),
  agreed:yup.boolean().oneOf([true],"you must agree to the terms"),
})

const avatars = [
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
]

function Login() {
  const {step,setStep,userPhoneData,setUserPhoneData,resetLoginState} = useLoginStore();
  const [phoneNumber,setPhoneNumber] = useState('');
  const [selectedCountry,setSelectedCountry] = useState(countries[0]);
  const [otp,setOtp] = useState(['','','','','',''])
  const [email,setEmail] = useState('');
  const [profilePicture,setProfilePicture] = useState(null);
  const [selectedAvatar,setSelectedAvatar] = useStat(avatars[0]);
  const [profilePictureFile,setProfilePictureFile] = useState(null);
  const [error,setError] = useState('');
  const {setUser} = useUserStore();

  const {
    register:loginRegister,
    handleSubmit:loginSubmit

  } = useform({
    resolver:yupResolver(loginValidationSchema)
  });

  return (
    <div>Login</div>
  )
}

export default Login