import { AxiosError } from "axios";
import { showToastMessage } from "./toast";

export const handleApiError = (error: AxiosError) => {
    if (error.response && error.response.data) {
        const serverMessage = (error.response.data as { message?: string }).message;
        showToastMessage(serverMessage || 'Something went wrong', 'error');
    } else {
        showToastMessage(error.message || 'An unknown error occurred', 'error');
    }
};
