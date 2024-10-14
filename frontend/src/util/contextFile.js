import { createContext, useContext } from "react";

export const UserContext = createContext();

export function useData() {
    return useContext(UserContext);
}