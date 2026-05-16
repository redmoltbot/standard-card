"use client";
import { createContext, useContext } from "react";

export const AppNameContext = createContext("SupaClaw Cafe");
export const useAppName = () => useContext(AppNameContext);
