import { Box, Button, Flex, FormControl, FormLabel, Heading, Input } from "@chakra-ui/react";
import { useData } from "../util/contextFile";
import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../util/constants";
import { useParams } from "react-router-dom";



export default function Default() {
  const {setAddRoom} = useData();
  const [ input, setInput ] = useState(false);
  const [ room, setRoom ] = useState('');
  const {id} = useParams();

  const addRoomFunction = async(event) => {
    event.preventDefault();
    setInput(prev => !prev);
    try{
      const response = await axios.post(BACKEND_URL+'/addroom', {room, id})
      if(response.status === 201){
        setAddRoom(value => value+1);
      }
      setRoom('')
    }catch(err){
      if(err.response){
        console.log(err.response.data);
      }else{
        console.log("Error: ", err.message);
      }
    }
  }
  
  return (
    <Flex w={"100%"} h={"100%"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"} p={4}>
        <Heading as="h3" mb={8}>What you want to do today?</Heading>
        <Flex>
            {!input && <Button onClick={() => setInput(prev => !prev)} mr={8}>Create Room</Button>}
            {!input && <Button onClick={() => setInput(prev => !prev)}>Join Room</Button>}
            { input && <Box as="form" onSubmit={addRoomFunction}>
            <FormControl>
              <FormLabel>Room Name: </FormLabel>
              <Input type="text" placeholder="Type room name..." value={room} onChange={(e) =>setRoom(e.target.value)}></Input>
              <Button type="submit" mt={4}>Add Room</Button>
            </FormControl>
            </Box>}
        </Flex>
    </Flex>
  )
}
