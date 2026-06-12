import axios from "axios";

const apiUrl = `${process.env.REACT_APP_API_URL}/api`


const axiosInstance = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});


export default axiosInstance;