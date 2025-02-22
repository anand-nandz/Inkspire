import axios from "axios";
import Swal from "sweetalert2";
import { CreateAxiosInstance } from "../../utils/interfaces/types";

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

const createAxiosInstance: CreateAxiosInstance = (baseUrl, tokenKey, refreshTokenKey) => {
    const instance =  axios.create({
        baseURL: baseUrl,
        withCredentials: true,
    });

    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem(tokenKey);
            
            if(token){
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config
        },
        (error) => Promise.reject(error)
    );

    
    instance.interceptors.response.use(
        (response) => response,        
        async (error) => {
            if (error.response) {
                
                if (error.response.status === 403 && error.response.data.message === 'Authentication required') {
                    localStorage.removeItem(tokenKey);
                    localStorage.removeItem(refreshTokenKey);
                    const result = await Swal.fire({
                        title: 'Session Expired',
                        text: 'Your session has expired. Please login again to continue.',
                        icon: 'warning',
                        confirmButtonText: 'Login',
                        allowOutsideClick: false,
                    });
                    if(result.isConfirmed){
                        
                        window.location.href = '/login'
                    }
                    return Promise.reject(error);
                }
                if (error.response?.status === 401) {
                    
                    if (error.response.data.message === "Authentication required" || error.response.data.message === "Token is not valid") {
                        
                        try {
                            const refreshResponse = await instance.post('/refresh-token',{},{withCredentials:true});
                            
                            const newToken = refreshResponse.data.token;    
                                                    
                            localStorage.setItem(tokenKey, newToken);

                            error.config.headers.Authorization = `Bearer ${newToken}`;
                            return instance(error.config);

                        } catch (refreshError) {
                            
                            localStorage.removeItem(tokenKey);
                            localStorage.removeItem(refreshTokenKey);
                            const result = await Swal.fire({
                                title: 'Session Expired',
                                text: 'Your session has expired. Please login again to continue.',
                                icon: 'warning',
                                confirmButtonText: 'Login',
                                allowOutsideClick: false,
                            });
                            if(result.isConfirmed){
                                
                                window.location.href = '/login'
                            }
                            return Promise.reject(refreshError);
                        }
                    } else if (error.response.data.message === 'Session expired') {
                        window.location.href = '/login'
                        return Promise.reject(error);
                    } 
                }

                if(error.response.status === 404){
                    window.location.href = '/*';
                    return Promise.reject(error);
                }
            }
            return Promise.reject(error);
        }
    );
   
    return instance;

}


export const axiosInstance = createAxiosInstance(`${BASE_URL}/api/user`, 'userToken', 'userRefresh');
