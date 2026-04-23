import axios from "axios";

const baseURL = process.env.NODE_ENV === "development" ? "http://localhost:2222/api" : "https://api.squareexp.com/api"

export const api = axios.create({

    baseURL: baseURL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
})