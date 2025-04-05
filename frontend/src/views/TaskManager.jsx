import {Box, Button, Flex, FormControl, FormLabel, Input, Text} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { DeleteIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
export default function TaskManager() {
  const {room} = useParams();
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const s = io("http://52.66.252.158", {
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
    if(!socket) return

    socket.emit("getTasks", room );

		socket.on("allTasks", (tasks) => {
			setTaskList(tasks);
		});

  },[socket, room])

  const addTaskFunction = (event) => {
    event.preventDefault();
    if(task){
      socket.emit("addTask", task, deadline, room);
      setTask("");
      setDeadline(null);
    }
    event.target.reset();
  };
  
  const deleteTaskFunction= (taskId, room) => {
    if(socket){
    socket.emit("deleteTask", taskId, room);
    }
  }

  return (
   <Flex w={"100%"} h={"100%"} flexDirection={'row'} justifyContent={"space-evenly"} alignItems={"flex-start"} p={4}>
    <Box w={"40%"}>
      <Text textAlign={'center'}fontSize={'xl'} fontWeight={'bold'}>Task Manager</Text>
      <Flex as="form" flexDirection={'column'} onSubmit={(e) => addTaskFunction(e)}>
        <FormControl isRequired>
          <FormLabel>Task: </FormLabel>
          <Input type="text" placeholder="Write your task here.." value={task} onChange={(e) => setTask(e.target.value)}></Input>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Deadline: </FormLabel>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}></Input>
        </FormControl>
        <Button type="submit" mt={4}>Add Task</Button>
      </Flex>
    </Box>

    <Flex w={"50%"}flexDirection={'column'} ml={4} alignItems={"flex-start"}>
    <Text textAlign={'center'}fontSize={'xl'} fontWeight={'bold'} mb={3}>Tasks List: </Text>
    { taskList.map((task,index) => {
      return(
        <Flex key={index} flexDirection={'row'} bgColor={'gray.500'} p={2} borderRadius={'md'} mb={2}>
          <Box>
            <Text><Text as="span" fontWeight={'bold'}>Task: </Text>{task.task}</Text>
            <Text><Text as="span" fontWeight={'bold'}>Deadline: </Text>{new Date(task.deadline).toLocaleDateString()}</Text>
          </Box>
          <IconButton
            onClick={() => deleteTaskFunction(task._id, room)}
            aria-label="Delete"
            icon={<DeleteIcon />}
            colorScheme="gray"
            ml={3}
          />
        </Flex>
      )
    })}
    </Flex>
   </Flex>
  )
}
