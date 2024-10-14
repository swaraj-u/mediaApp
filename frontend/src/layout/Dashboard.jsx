import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import axios from 'axios';
import { Link, Outlet } from 'react-router-dom';
import { BACKEND_URL } from '../util/constants';
import { useData } from '../util/contextFile';
import { authUser } from '../util/authUser';
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { io } from 'socket.io-client';



export default function Dashboard() {
  const {isLoggedIn, setIsLoggedIn, addRoom, setAddRoom} = useData();
  const {id, room} = useParams();
  const location = useLocation();
  const [socket, setSocket] = useState(null)
  const [ currentTab, setCurrentTab ] = useState("");
  const [ currentuser, setUser ] = useState({});
  const [ users, setUsers ] = useState([]);

  useEffect(() => {
    const s = io(BACKEND_URL)
    s.on("connect",() =>{
      console.log("dashboard connected.")
    })
    setSocket(s);
    return () => {
      s.disconnect();
    }
  },[])

  useEffect(() => {
    if(socket === null) return
      socket.on("users-updated", users => {
      setUsers(users);
      console.log(users)
    })
  },[socket,addRoom])

  useEffect(() => {
    const path = location.pathname;
    const segments = path.split("/");
    if(segments.includes("chat")){
      setCurrentTab("chat");
    }else if(segments.includes("document")){
      setCurrentTab("document");
    }else if(segments.includes("task_manager")){
      setCurrentTab("task_manager");
    }
  },[location])
  useEffect(() => {
    const Userdata = async (id) => {
      try{
        const response = await axios.post(BACKEND_URL+'/userdata',{_id:id});
        if(response.status === 200){
          const user = response.data.user;
          const users = response.data.users;
          setUser(user);
          setUsers(users);

          socket.emit("update-users");
        }
      }catch(err){
        if(err.response){
          console.log(err.response.data);
        }else{
          console.log("Error: ", err.message);
        }
      }
    }
    Userdata(id);
  },[id,addRoom,socket])

  const logoutFunction = async() => {
    try{
      const response = await axios.get(BACKEND_URL+'/logout',{withCredentials:true} );
      if(response.status === 200){
        const loggedIn = await authUser();
        setIsLoggedIn(loggedIn);
      }
    }catch(err){
      if(err.response){
        console.log(err.response.data);
      }else{
        console.log("Error: ", err.message);
      }
    }

  }

  return (
    <Box w={"100vw"} h={"100vh"} boxSizing='border-box'>
      <Flex w={"100%"} h={'100%'}>
        <Box as="aside" w={"30vw"} h={'100vh'} bgColor={'gray.600'} flexGrow={0} boxSizing='border-box' p={"8"}>
          <Heading as="h3" fontWeight={"thin"} color={"white"}>Hello, <Text as="span" fontWeight={"bold"} color={"white"}>{currentuser.username}</Text></Heading>
          <Flex flexDirection={'column'}>
            <Text fontSize={"xl"} color={"white"} mt={8} mb={3}>Already Joined Rooms: </Text>
            {(currentuser.rooms || []).map((room, index) => {
              return (
              <Box key={index} mb={2}>
                <Link to={`${room}/chat`}><Text color={'gray.50'} p={1} pl={2} borderRadius={'md'} bgColor={'gray.700'}fontSize={'xl'} fontWeight={'bold'}>{room}</Text></Link>
                {
                (users || []).filter(user => user.rooms.includes(room))
                      .map((user, index) => {
                          return (user.username === currentuser.username) ? <Box as="li" key={index} color={'gray.200'} fontSize={'md'}>{user.username} (You)</Box>
                       : <Box as="li" key={index} color={'gray.200'} fontSize={'md'}>{user.username}</Box>
                      })}
              </Box>
              )
            })}
          </Flex>
        </Box>
        <Flex direction={'column'} w={"100%"} h={'100%'}>
          <Flex as="nav" w={"100%"} h={'60px'} padding={'4'} flexFlow={0} bgColor={'gray.500'} justifyContent={"space-between"} alignItems={"center"}>
            <Box>{room && <Link to={`/dashboard/${id}`}><Button leftIcon={<ArrowBackIcon />} _hover={{boxShadow:"xl"}} bgColor={'gray.400'} colorScheme={"gray.100"} variant="solid"></Button></Link>}</Box>
            <Box>
              {room && <Link to={`/dashboard/${id}/${room}/chat`}><Button mr={4} bgColor={ currentTab==="chat" ? 'black' : 'white'} _hover={currentTab==="chat" ? { bg: "black", boxShadow: "xl"} : { bg: "white", boxShadow: "xl"}} color={currentTab==="chat" ? 'white' : 'black'}>Chat</Button></Link>}
              {room && <Link to={`/dashboard/${id}/${room}/document`}><Button mr={4} bgColor={ currentTab==="document" ? 'black' : 'white'} _hover={currentTab==="document" ? { bg: "black", boxShadow: "xl"} : { bg: "white", boxShadow: "xl"}} color={currentTab==="document" ? 'white' : 'black'}>Document</Button></Link>}
              {room && <Link to={`/dashboard/${id}/${room}/task_manager`}><Button mr={4} bgColor={ currentTab==="task_manager" ? 'black' : 'white'} _hover={currentTab==="task_manager" ? { bg: "black", boxShadow: "xl"} : { bg: "white", boxShadow: "xl"}} color={currentTab==="task_manager" ? 'white' : 'black'}>Task Manager</Button></Link>}
            </Box>  
            <Button onClick={logoutFunction}><Text>Logout</Text></Button>
          </Flex>
          <Box as="main" w={"100%"} h={"100%"} bgColor={'gray.400'}>
            <Outlet/>
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}