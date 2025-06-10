import { Box, Text } from "@chakra-ui/react";


export default function ErrorPage() {
  return (
    <Box width="100vw" height="100vh" display="flex" justifyContent={"center"} alignItems={"center"} bg="#1f1f1f">
      <Text fontSize={"2xl"} color="white">Sorry! But you entered a wrong url</Text>
    </Box>
  )
}
