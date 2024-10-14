import { Box, Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Heading, Input, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { BACKEND_URL } from '../util/constants';
import { Link, useNavigate } from 'react-router-dom';


export default function Signup() {

    const [usernames, setUsernames] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isMatched, setIsMatched] = useState(false);
    const navigate = useNavigate();

  useEffect(() => {

    const fetchUsers = async () => {
        try{
            const response = await axios.get(BACKEND_URL+'/signup/users');
            const users = response.data.users;
            console.log(users);
            const usernames = users.map(user => user.username);
            console.log(usernames);
            setUsernames(usernames);
        }
        catch(err){

            if(err.response){
                console.log(err.response.data);
            }else{
            console.log(err);
            }
        }
    }
    fetchUsers();
    
  },[])

  useEffect(() => {
    console.log(isMatched, username, usernames[0])
  },[isMatched])

  const onChangeFunction = (event) => {
    setUsername(event.target.value);
    if(usernames.includes(event.target.value)){
        setIsMatched(true)
    }else{
        setIsMatched(false);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try{
        const response = await axios.post(BACKEND_URL + '/add/user', {username, password});
        if(response.status === 201){
            console.log("User added.");
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
    <Box bgColor={'gray.300'} width={"100vw"} height={"100vh"} boxSizing='border-box'>
      <Flex w={"100%"} h={"100%"} alignItems={"center"} justifyContent={"flex-start"}>
        <Box bgColor={'gray.700'} w={"25vw"} h={"100vh"}>
          <Flex as="form" onSubmit={handleSubmit} color={"white"} w={"100%"} h={"100%"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"} p={"15px"}>
            <Heading as="h3" color={"white"}><Text>Sign Up</Text></Heading>
            <FormControl isInvalid={isMatched} mb={8} isRequired>
              <FormLabel>Username: </FormLabel>
              <Input type='text' placeholder='Enter your username' value={username} onChange={onChangeFunction}></Input>
              {isMatched ? (
                <FormErrorMessage>Username already used.</FormErrorMessage>
            ) : (
                <FormHelperText color={"white"}>
                Enter a unique username.
                </FormHelperText>
            )}
            </FormControl>
            <FormControl isRequired mb={8}>
              <FormLabel>Password: </FormLabel>
              <Input type='password' placeholder='Enter your password' value={password} onChange={(e) => setPassword(e.target.value)}></Input>
            </FormControl>
            <Button type="submit" mb={8}>Sign Up!</Button>
            <Text color={'gray.200'}>Already have an account? <Link to="/login"><Text as="span" color={'white'}>Login</Text></Link></Text>
          </Flex>
        </Box>
        <Box bgColor={'gray.600'} w={"5vw"} h={"100vh"}></Box>
        <Box bgColor={'gray.500'} w={"3vw"} h={"100vh"}></Box>
        <Box bgColor={'gray.400'} w={"1vw"} h={"100vh"}></Box>
      </Flex>
    </Box>
  )
}
