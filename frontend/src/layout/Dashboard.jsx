import { Box, Button, Divider, Flex, Heading, Text, Menu, MenuButton, IconButton, MenuList, MenuItem, Spinner } from '@chakra-ui/react';
import axios from 'axios';
import { Link, Outlet } from 'react-router-dom';
import { BACKEND_URL } from '../util/constants';
import { useData } from '../util/contextFile';
import { authUser } from '../util/authUser';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowBackIcon, HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { io } from 'socket.io-client';
import { FaEllipsisV } from "react-icons/fa";


export default function Dashboard() {
  const {setIsLoggedIn, addRoom} = useData();
  const {id, room} = useParams();
  const location = useLocation();
  const [socket, setSocket] = useState(null)
  const [ currentTab, setCurrentTab ] = useState("");
  const [ currentuser, setUser ] = useState({});
  const [ users, setUsers ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ exitedGroup, setExitedGroup ] = useState(0);
  const [ threeLinesClicked, setThreeLinesClicked ] = useState(false);
  const navigate = useNavigate();
  
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
  },[socket,addRoom, exitedGroup])

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
          if(socket){
          socket.emit("update-users");
          }
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
  },[id,addRoom,socket, exitedGroup])

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

  const exitGroupFunction = async(room) => {
    try{
      const response = await axios.post(BACKEND_URL+'/exit-group', {room, id});
      if(response.status === 200){
        setExitedGroup(prev => (prev+1));
        console.log("exited-gorup: ", exitedGroup);
        navigate(`/dashboard/${id}`, {replace: true});
        setIsLoading(false);
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
        <Flex className={threeLinesClicked ? "sidebar-open" : "sidebar"} as="aside" flexDirection={'column'} justifyContent={'space-between'} w={{base:"175.55px", md:"30vw"}} h={'100vh'} bgColor={'gray.600'} flexGrow={0} boxSizing='border-box' p={"4"}>
        <Box className="close-icon" onClick={() => setThreeLinesClicked(false)}><CloseIcon /></Box>
        <Flex flexDirection={'column'}>
          <Box display="flex" width="100%" justifyContent={"space-between"}>
            <Heading as="h3" fontWeight={"thin"} color={"white"} fontSize={"3xl"}>Hello, <Text as="span" whiteSpace={'nowrap'} fontWeight={"bold"} color={"white"} fontSize={{base:'xl', md:'2xl'}}>{currentuser.username}</Text></Heading>
            { isLoading && <Spinner size="lg" color="gray.500" />}
          </Box>
          <Flex flexDirection={'column'}>
            {/* <Text fontSize={"xl"} color={"white"} mt={8} mb={3}>Already Joined Rooms: </Text> */}
            <Divider mt={4} mb={4}></Divider>
            {(currentuser.rooms || []).map((room, index) => {
              return (
              <Box key={index} mb={2} display="flex" width="100%" justifyContent={"space-between"} bgColor={'gray.700'} alignItems={"center"} borderRadius={'md'}>
                <Link to={`${room}/chat`}><Text color={'gray.50'} whiteSpace={'nowrap'} p={1} pl={2} fontSize={{base:'md', md:'2xl'}} fontWeight={'bold'}>{room}</Text></Link>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FaEllipsisV />}
                    variant="ghost"
                    color="gray.300"
                    size="sm"
                    ml={2}
                    mr={2}
                    _hover={{ bg: 'gray.600' }}
                  />
                  <MenuList bg="gray.800" borderColor="gray.600">
                    {(users || []).filter(user => user.rooms.includes(room))
                    .map((user, idx) => (
                      <MenuItem
                        key={idx}
                        bg="gray.800"
                        _hover={{ bg: 'gray.700' }}
                        color="gray.100"
                        fontSize="sm"
                      >
                        {user.username === currentuser.username ? `${user.username} (You)` : user.username}
                      </MenuItem>
                    ))}
                      <Divider></Divider>
                      <Box p="2" pl="3" _hover={{ bg: 'gray.700', cursor: 'pointer' }}><Text color="white" onClick={() => {exitGroupFunction(room); setIsLoading(true);}}>Exit Group</Text></Box>
                  </MenuList>
                </Menu>
              </Box>
              )
            })}
          </Flex>
          </Flex>
          <Flex gap={1}>
           <Box>{room && <Link to={`/dashboard/${id}`}><Button leftIcon={<ArrowBackIcon />} _hover={{boxShadow:"xl"}} bgColor={'gray.400'} colorScheme={"gray.100"} variant="solid"></Button></Link>}</Box>
           <Button onClick={logoutFunction}><Text>Logout</Text></Button>
           </Flex>
        </Flex>
        <Flex direction={'column'} w={"100%"} h={'100%'}>
          <Flex as="nav" w={"100%"} h={'60px'} padding={'4'} flexFlow={0} bgColor={'gray.500'} justifyContent={"center"} alignItems={"center"}>
            <Box className="three-lines" paddingRight={"15px"} onClick={() => setThreeLinesClicked(true)}>{!threeLinesClicked && <HamburgerIcon boxSize={6}/>}</Box>
            <Flex>
              {room && <Link to={`/dashboard/${id}/${room}/chat`}><Button mr={4} fontSize={{base:'xs', md:'lg'}} bgColor={ currentTab==="chat" ? 'black' : 'white'} _hover={currentTab==="chat" ? { bg: "black", boxShadow: "xl"} : { bg: "white", boxShadow: "xl"}} color={currentTab==="chat" ? 'white' : 'black'}>Chat</Button></Link>}
              {room && <Link to={`/dashboard/${id}/${room}/document`}><Button mr={4} fontSize={{base:'xs', md:'lg'}} bgColor={ currentTab==="document" ? 'black' : 'white'} _hover={currentTab==="document" ? { bg: "black", boxShadow: "xl"} : { bg: "white", boxShadow: "xl"}} color={currentTab==="document" ? 'white' : 'black'}>Document</Button></Link>}
              {room && <Link to={`/dashboard/${id}/${room}/task_manager`}><Button mr={4} fontSize={{base:'xs', md:'lg'}} bgColor={ currentTab==="task_manager" ? 'black' : 'white'} _hover={currentTab==="task_manager" ? { bg: "black", boxShadow: "xl"} : { bg: "white", boxShadow: "xl"}} color={currentTab==="task_manager" ? 'white' : 'black'}>Task Manager</Button></Link>}
            </Flex>  
          </Flex>
          <Box as="main" w={"100%"} h={"100%"} bgColor={'gray.400'}>
            <Outlet/>
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}
