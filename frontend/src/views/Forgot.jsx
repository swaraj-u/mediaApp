import { Box, Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../util/constants";
import { useNavigate } from "react-router-dom";

export default function Forgot() {
    const [username, setUsername] = useState('');
    const [usernames, setUsernames] = useState([]);
    const [isMatched, setIsMatched] = useState(false);
    const [email, setEmail] = useState('');
    const navigate= useNavigate();

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
        const response = await axios.post(BACKEND_URL + '/sendOTP', {username, email});
        if(response.status === 200){
            console.log("Email sent.");
            const id = response.data._id;
            const otp = response.data.otp;
            navigate(`${id}/${otp}`);
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
    <Box w='30vw' h="50vh" display={'flex'} flexDirection={'column'}>
        <Box as="form" onSubmit={(e) => handleSubmit(e)}>
             <FormControl isInvalid={!isMatched} isRequired mb={8}>
                <FormLabel>Username: </FormLabel>
                <Input type="text" placeholder="Type your username..." value={username} onChange={(e) => onChangeFunction(e)}></Input>
                {isMatched ? (
                     <FormHelperText color={"white"}>
                     Enter exisiting username.
                     </FormHelperText>
            ) : (
                <FormErrorMessage>Username does not exist.</FormErrorMessage>
            )}
             </FormControl>
             <FormControl isRequired mb={8}>
                <FormLabel>Email: </FormLabel>
                <Input type="email" placeholder="Type your email..." value={email} onChange={(e) => setEmail(e.target.value)}></Input>
             </FormControl>
             <Button type="submit" mb={8}>Submit</Button>
        </Box>
    </Box>
   </Flex>
  )
}
