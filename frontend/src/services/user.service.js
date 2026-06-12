import axiosInstance from "./url.service";

export const sendOtp = async (phoneNumber, phoneSuffix, email) => {
    try {
        const response = await axiosInstance.post("/auth/send-otp", { phoneNumber, phoneSuffix, email });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const verifyOtp = async (phoneNumber, phoneSuffix, email, otp) => {
    try {
        const response = await axiosInstance.post("/auth/verify-otp", { phoneNumber, phoneSuffix, email, otp });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const updateUserProfile = async (updateData) => {
    try {
        const response = await axiosInstance.post("/auth/update-profile",updateData);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const checkUserAuth = async () => {
    try {
        const response = await axiosInstance.get("/auth/check-auth");
        if(response.data.success === 'success'){
            return {isAuthenticated: true, userData: response?.data?.data};
        }
        else if(response.data.success === 'error'){
            return {isAuthenticated: false};
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const logoutUser = async (updateData) => {
    try {
        const response = await axiosInstance.post("/auth/logout",updateData);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getAllUsers = async() => {
    try {
        const response = await axiosInstance.get("/auth/users");
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}