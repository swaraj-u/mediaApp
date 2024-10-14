import { Alert, AlertIcon, Box, Button, Flex, FormControl, FormLabel, Heading, Input, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { BACKEND_URL } from '../util/constants';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useData } from '../util/contextFile';
import { authUser } from '../util/authUser';

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const {isLoggedIn, setIsLoggedIn} = useData();

  useEffect(() => {
    if(error){
      const timer = setTimeout(() => {
        setError('')
      }, 3000)
      return () => clearTimeout(timer);
    }
  },[error])

  const handleSubmit = async (event) => {
    event.preventDefault();
    try{
    const response = await axios.post(BACKEND_URL+"/login", {username, password}, {withCredentials:true});

    if(response.status === 200){
      console.log("Login successful.");
      const loggedIn = await authUser();
      setIsLoggedIn(loggedIn);
    }
    }catch(err){
      
      if(err.response){
        if(err.response.status === 404){
          console.log(err.response.data);
          setError(err.response.data)
        }else if(err.response.status === 401){
          console.log(err.response.data);
          setError(err.response.data)
        }else{
          console.log(err.response.data);
          setError(err.response.data)
        }
      } else{
        console.log('Error: ', err.message);
        setError(err.response.data)
      }
      }
    }
  
  return (
    <Box bgColor={'gray.300'} width={"100vw"} height={"100vh"} boxSizing='border-box'>
      <Flex w={"100%"} h={"100%"} alignItems={"center"} justifyContent={"flex-end"}>
        <Box bgColor={'gray.400'} w={"1vw"} h={"100vh"}></Box>
        <Box bgColor={'gray.500'} w={"3vw"} h={"100vh"}></Box>
        <Box bgColor={'gray.600'} w={"5vw"} h={"100vh"}></Box>
        <Box bgColor={'gray.700'} w={{base: "45vw", md:"30vw"}} h={"100vh"}>
          <Flex as="form" onSubmit={handleSubmit} color={"white"} w={"100%"} h={"100%"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"} p={"15px"}>
            <Heading as="h3" color={"white"}><Text>Login</Text></Heading>
            <FormControl isRequired mb="8">
              <FormLabel>Username: </FormLabel>
              <Input type='text' placeholder='Enter your username' value={username} onChange={(e) => setUsername(e.target.value)}></Input>
            </FormControl>

            <FormControl isRequired mb="8">
              <FormLabel>Password: </FormLabel>
              <Input type='password' placeholder='Enter your password' value={password} onChange={(e) => setPassword(e.target.value)}></Input>
            </FormControl>
            {error && (
                    <Alert status="error" mb="4" color={"black"}>
                        <AlertIcon />
                        {error}
                    </Alert>
                )}
            <Button type="submit" mb="8">Submit</Button>
            <Text color={'gray.200'}>Don&apos;t have an account? <Link to="/signup"><Text as="span" color={'white'}>Sign Up</Text></Link></Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}
