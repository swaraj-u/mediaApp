import { Box, Flex, FormControl, Input, Text, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
import { io } from "socket.io-client";

export default function Chat() {
  const {id, room} = useParams();
  const [currentUser, setCurrentUser] = useState("");
  const [currentChat, setCurrentChat] = useState("");
  const [socket, setSocket] = useState(null);
  const [messageList, setMessageList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   setIsLoading(false);
  // }, [messageList])


  useEffect(() => {
    const s = io("http://35.154.54.168", {
      path: "/api/socket.io",
      withCredentials: true
    });
    s.on("connect",() => {
      console.log("doc connected.");
    });
    setSocket(s)
    return () => {
      s.disconnect()
    }
  },[])

  useEffect(() => {
    if(socket){
      socket.emit("send-user", id, room);
    }
  },[id, room, socket])

  useEffect(() => {
    if(socket){
    socket.on("receive-user", (user) => {
      setCurrentUser(user)
    });
    }
  },[id, room, socket])

  useEffect(() => {
    if(socket){
    socket.on("get-messageList", (messageList, roomId) => {
      if(roomId === room){
        setMessageList(messageList);
        setIsLoading(false);
      }
    });
  }
  },[id, room, socket])

  const submitMessage = (e) => {
    e.preventDefault();
    if(currentChat){
      socket.emit("send-message", currentChat, room, id)
      setCurrentChat("");
    }
    
  }


  return (
    <Flex w={"100%"} h={"100%"} flexDirection={'column-reverse'} alignItems={"center"} justifyContent={"flex-start"} p={4}>
      <Box as="form" w={"100%"} display={"flex"} alignItems={"center"} onSubmit={(e) => submitMessage(e)}>
        <FormControl isRequired w={"100%"} display={"flex"} ml="2">
          <Input w={"100%"} type="text" placeholder="Type something..." value={currentChat} onChange={(e) => {setCurrentChat(e.target.value)}}></Input>
          <IconButton
          type="submit"
            ml={2}
            aria-label="Send"
            icon={<ArrowForwardIcon />}
            colorScheme="gray"
          />
        </FormControl>
      </Box>
      <Flex w="100%" h="100%" flexDirection="column" alignItems="center" justifyContent="flex-start">
        {
          isLoading ? (
            <Spinner size="xl" color="gray.500" />
          ) : (
            messageList.length === 0 ? (
              <Box width="100%" h="100%" display="flex" justifyContent={"center"} alignItems={"flex-end"}>
                <Text mt={4} fontSize="lg" color="gray.600" mb={4}>Start with a Hi!👋</Text>
              </Box>
            ) : (
              messageList.map((message, index) => (
                message.username === currentUser ? (
                  <Box
                    key={index}
                    alignSelf="flex-end"
                    mt={2}
                    mb={2}
                    w="fit-content"
                    bgColor="gray.500"
                    p={2}
                    borderRadius="md"
                    color="white"
                  >
                    <Text fontSize="xs" color="white">You</Text>
                    <Text>{message.message}</Text>
                  </Box>
                ) : (
                  <Box
                    key={index}
                    alignSelf="flex-start"
                    mt={2}
                    mb={2}
                    w="fit-content"
                    bgColor="gray.500"
                    p={2}
                    borderRadius="md"
                    color="white"
                  >
                    <Text fontSize="xs" color="white">{message.username}</Text>
                    <Text>{message.message}</Text>
                  </Box>
                )
              ))
            )
          )
        }
      </Flex>
    </Flex>
  )
}
