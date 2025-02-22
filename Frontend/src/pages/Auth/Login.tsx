"use client"

import { Button, Input, Divider, Link as NextUILink } from "@nextui-org/react"
import { Facebook, Twitter, Instagram, Github } from "lucide-react"
// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from "react-router-dom";
import { USER } from "../../utils/constants/constants";
import { useDispatch, useSelector } from "react-redux";
import UserRootState from "../../redux/rootstate/UserState";
import { useEffect } from "react";
import { Formik, Form } from 'formik';
import { loginValidationSchema } from "../../utils/validations/authValidations";
import { LoginFormValues } from "../../utils/interfaces/interfaces";
import { handleApiError } from "../../utils/helpers/HandleApiError";
import { AxiosError } from "axios";
import { axiosInstance } from "../../config/api/axiosInstance";
import { setUserInfo } from "../../redux/slices/UserSlice";
import { showToastMessage } from "../../utils/helpers/toast";

// const client_id = import.meta.env.VITE_CLIENT_ID || ''

export default function LoginPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector((state: UserRootState) => state.user.userData)

    useEffect(() => {
        if (userInfo) {
            navigate('/home')
        }
    }, [userInfo, navigate]);

    const handleSubmit = async (values: LoginFormValues) => {
        try {
            const response = await axiosInstance.post('/login', values, {
                withCredentials: true
            });
            
            if (response) {
                localStorage.setItem('userToken', response.data.token);
                dispatch(setUserInfo(response.data?.user));
                showToastMessage(response.data.message, 'success');
                console.log(userInfo);
                navigate('/home');

            }
        } catch (error) {
            handleApiError(error as AxiosError)
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* <GoogleOAuthProvider clientId={client_id}> */}
            {/* Left Section */}
            <div className="relative hidden w-1/2 lg:block">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('/images/login.jpg')",
                    }}
                />
                <div className="relative z-20 p-8 h-full flex flex-col">
                    <nav className="flex justify-between items-center">

                        <div className="space-x-4">
                            <Link to={USER.SIGNUP}>
                                <Button variant="bordered" className="text-white border-white">
                                    Join Us
                                </Button>
                            </Link>

                        </div>
                    </nav>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-white text-center space-y-4">
                            <h2 className="text-4xl font-bold">Start Your Writing Journey</h2>
                            <p className="text-xl">Join our community of creative writers</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Right Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <Link to={USER.LANDINGPAGE}>
                            <h1 className="text-4xl font-bold mb-8">Inkspire✒️</h1>
                        </Link>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">Hi Writer✍️</h2>
                            {/* <p className="text-gray-500">Welcome to Inkspire</p> */}
                        </div>
                    </div>
                    <Formik
                        initialValues={{
                            email: '',
                            password: ''
                        }}
                        validationSchema={loginValidationSchema}
                        validateOnMount={true}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched, handleChange, handleBlur, values }) => (
                            <Form className="space-y-6 mt-8">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className={`block mb-2 text-sm font-medium ${errors.email && touched.email ? 'text-red-500' : 'text-gray-900'}`}>
                                            {errors.email && touched.email ? `*${errors.email}` : <>Email <span className="text-red-500">*</span></>}
                                        </label>
                                        <Input
                                            type="email"
                                            name="email"
                                            variant="bordered"
                                            placeholder="Enter your email"
                                            value={values.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            classNames={{ input: "px-2 py-2 " }}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className={`block mb-2 text-sm font-medium ${errors.password && touched.password ? 'text-red-500' : 'text-gray-900'}`}>
                                            {errors.password && touched.password ? `*${errors.password}` : <>Password <span className="text-red-500">*</span></>}
                                        </label>
                                        <Input
                                            type="password"
                                            name="password"
                                            variant="bordered"
                                            placeholder="Enter your password"
                                            value={values.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            classNames={{ input: "px-2 py-2" }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <NextUILink href="#" className="text-red-500">
                                        Forgot password?
                                    </NextUILink>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white p-2"
                                    size="lg"
                                >
                                    Sign In
                                </Button>
                            </Form>
                        )}
                    </Formik>




                    <div className="space-y-6">
                        <Divider />
                        <div className="text-center">
                            <p className="text-gray-500">
                                Don't have an account?{" "}
                                <NextUILink href={USER.SIGNUP} className="text-red-500">
                                    Sign up
                                </NextUILink>
                            </p>
                        </div>
                        <div className="flex justify-center gap-6">
                            <NextUILink href="#" className="text-gray-400 hover:text-gray-600">
                                <Facebook className="h-5 w-5" />
                            </NextUILink>
                            <NextUILink href="#" className="text-gray-400 hover:text-gray-600">
                                <Twitter className="h-5 w-5" />
                            </NextUILink>
                            <NextUILink href="#" className="text-gray-400 hover:text-gray-600">
                                <Instagram className="h-5 w-5" />
                            </NextUILink>
                            <NextUILink href="#" className="text-gray-400 hover:text-gray-600">
                                <Github className="h-5 w-5" />
                            </NextUILink>
                        </div>
                    </div>
                </div>
            </div>
            {/* </GoogleOAuthProvider> */}

        </div>
    )
}