import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, IconButton, Input } from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../util/constants";
import { useData } from "../util/contextFile";

export default function ResetPassord() {
    const {id, otp} = useParams();
    const {setHasForgotten} = useData();
    const [password, setPassword] = useState('');
    const [confirmPassord, setConfirmPassword] = useState('');
    const [passwordMatched, setPasswordMatched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [OTP, setOTP] = useState(null);
    const [otpMatched, setOtpMatched] = useState(false);
    const navigate = useNavigate();

    const handlePasswordToggle = () => {
        setShowPassword(prev => !prev);
    };

    const confirmPasswordFunction = (event) => {
        setConfirmPassword(event.target.value);
        if(password === event.target.value){
          setPasswordMatched(true)
        }else{
          setPasswordMatched(false)
        }
      }

    const updatePasswordFunction = async (event) => {
        event.preventDefault();
        try{
            const response = await axios.post(BACKEND_URL+'/updatePassword', {id, password});
            if(response.status === 200){
                console.log("Password updated successfully.");
                setHasForgotten(false);
                navigate('/login');
            }
        }catch(err){
        if(err.response){
            console.log(err.response.data);
        }else{
            console.log('Error: ', err.message);
        }
    }
    }

  return (
    <Flex w="100vw" h="100vh" justifyContent={'center'} alignItems={'center'}>
        <Box w={"30vw"} h={'30vh'} display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
            <Box as="form" onSubmit={(e) => updatePasswordFunction(e)}>
            <FormControl isInvalid={!otpMatched}>
                <FormLabel>OTP: </FormLabel>
                <Input type="number" placeholder="Enter the otp..." value={OTP} 
                onChange={(e) => {
                    setOTP(e.target.value)
                    if(otp === e.target.value){
                        setOtpMatched(true)
                    }else{
                        setOtpMatched(false)
                    }
                }}></Input>
                {otpMatched ? (
                <FormHelperText color={"white"}>
                OTP Matched.
                </FormHelperText>
            ) : (
              <FormErrorMessage>Not matching.</FormErrorMessage>
            )}
            </FormControl>
            <FormControl isRequired mb={8} position="relative">
              <FormLabel>Password: </FormLabel>
              <Input  type={showPassword ? 'text' : 'password'} placeholder='Enter your password' value={password} 
              onChange={(e) => {
                setPassword(e.target.value)
                if(e.target.value !== confirmPassord){
                  setPasswordMatched(false)
                }else{
                  setPasswordMatched(true)
                }
              }}></Input>
              <IconButton
                    position="absolute"
                    right="0"
                    bottom="0"
                    onClick={handlePasswordToggle}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                />
            </FormControl>
            <FormControl isInvalid={!passwordMatched} isRequired mb={8}>
              <FormLabel>Confirm Password: </FormLabel>
              <Input type='password' placeholder='Enter confirm password' value={confirmPassord} onChange={(e) => confirmPasswordFunction(e)}></Input>
              {passwordMatched ? (
                <FormHelperText color={"white"}>
                Password Matched.
                </FormHelperText>
            ) : (
              <FormErrorMessage>Not matching.</FormErrorMessage>
            )}
            </FormControl>
            <Button type="submit">Submit</Button>
            </Box>
        </Box>
    </Flex>
  )
}
