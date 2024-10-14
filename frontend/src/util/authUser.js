import axios from "axios"
import { BACKEND_URL } from "./constants"

export const authUser = async () => {
    try{
        const response = await axios.get(BACKEND_URL+'/authuser',{withCredentials:true});

        if(response.status === 200){
            return response.data._id;
        }
    }catch(err){
        if(err.response){
            console.log(err.response.data);
            return null;
        }
    }
}