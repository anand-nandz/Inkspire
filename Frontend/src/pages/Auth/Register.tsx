import React, { useState } from 'react';
import { Pen, Mail, Calendar, Key, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { AxiosError } from 'axios';
import { handleApiError } from '../../utils/helpers/HandleApiError';
import { UserData } from '../../utils/interfaces/interfaces';
import { validationSchema } from '../../utils/validations/authValidations';
import { writerTypes, writingInterests } from '../../utils/interfaces/types';
import { axiosInstance } from '../../config/api/axiosInstance';
import { showToastMessage } from '../../utils/helpers/toast';

const RegistrationPage: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [showInterests, setShowInterests] = useState<boolean>(false);
    const handleNext = () => setStep((prev) => prev + 1)
    const handleBack = () => setStep((prev) => prev - 1);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (values: UserData) => {
        try {
            setIsLoading(true)
            console.log(values);
            const dataToSend = { ...values, profileImage: '' }
            console.log(dataToSend,'datatosend');
            
            const response = await axiosInstance.post('/signup', dataToSend, {
                withCredentials: true
            })
            console.log(response.data, 'in signuppp');


            if (response?.data?.email) {
                showToastMessage('OTP sent successfully', 'success');
                localStorage.setItem('otpData', JSON.stringify({
                    otpExpiry: response.data.otpExpiry,
                    resendAvailableAt: response.data.resendAvailableAt,
                    email: response.data.email
                }));
                navigate('/verifyOtp');
            }
        } catch (error) {
            handleApiError(error as AxiosError);
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="fixed top-0 left-0 p-6">
                <h1 className="text-3xl font-serif font-bold text-gray-900">
                    Ink<span className="text-gray-600">Spire</span>
                </h1>
            </div>

            <div className="flex items-center justify-center min-h-screen p-4">
                <Formik
                    initialValues={{
                        _id: '',
                        firstName: '',
                        lastName: '',
                        email: '',
                        dob: '',
                        password: '',
                        confirmPassword: '',
                        role: '',
                        interests: []
                    }}
                    validationSchema={validationSchema(step)}
                    validateOnMount={true}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched, validateForm, setTouched, values, setFieldValue }) => {
                        return (
                            <Form className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-xl">
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-2xl font-serif text-gray-900">Begin Your Writing Journey</h2>
                                            <Link to="/" className="text-gray-400 hover:text-gray-600">
                                                ✕
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="firstName" className={`block mb-2 text-sm font-medium ${errors.firstName && touched.firstName ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {errors.firstName && touched.firstName ? `*${errors.firstName}` : <>First Name <span className="text-red-500">*</span></>}
                                                </label>

                                                <div className="relative">
                                                    <Field
                                                        type="text"
                                                        name="firstName"
                                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                                        placeholder="Your first name" required
                                                    />
                                                    <Pen className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="lasttName" className={`block mb-2 text-sm font-medium ${errors.lastName && touched.lastName ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {errors.lastName && touched.lastName ? `*${errors.lastName}` : <>Last Name <span className="text-red-500">*</span></>}
                                                </label>

                                                <div className="relative">
                                                    <Field
                                                        type="text"
                                                        name="lastName"
                                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                                        placeholder="Your last name"
                                                    />
                                                    <Pen className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="email" className={`block mb-2 text-sm font-medium ${errors.email && touched.email ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {errors.email && touched.email ? `*${errors.email}` : <>Email <span className="text-red-500">*</span></>}
                                                </label>
                                                <div className="relative">
                                                    <Field
                                                        type="email"
                                                        name="email"
                                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                                        placeholder="your@email.com"
                                                    />
                                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="dob" className={`block mb-2 text-sm font-medium ${errors.dob && touched.dob ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {errors.dob && touched.dob ? `*${errors.dob}` : <>Date of Birth <span className="text-red-500">*</span></>}
                                                </label>
                                                <div className="relative">
                                                    <Field
                                                        type="date"
                                                        name="dob"
                                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                                    />
                                                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="password" className={`block mb-2 text-sm font-medium ${errors.password && touched.password ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {errors.password && touched.password ? `*${errors.password}` : <>Password <span className="text-red-500">*</span></>}
                                                </label>
                                                <div className="relative">
                                                    <Field
                                                        type="password"
                                                        name="password"
                                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                                        placeholder="Create password"
                                                    />
                                                    <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="confirmPassword" className={`block mb-2 text-sm font-medium ${errors.confirmPassword && touched.confirmPassword ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {errors.confirmPassword && touched.confirmPassword ? `*${errors.confirmPassword}` : <>Confirm Password<span className="text-red-500">*</span></>}
                                                </label>
                                                <div className="relative">
                                                    <Field
                                                        type="password"
                                                        name="confirmPassword"
                                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                                        placeholder="Confirm password"
                                                    />
                                                    <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    const validationErrors = await validateForm();

                                                    if (Object.keys(validationErrors).length > 0) {
                                                        console.log('Error found:', validationErrors);
                                                        setTouched({
                                                            firstName: true,
                                                            lastName: true,
                                                            email: true,
                                                            dob: true,
                                                            password: true,
                                                            confirmPassword: true,
                                                        });
                                                    } else {
                                                        handleNext();
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                                            >
                                                Next
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-serif text-gray-900 text-center">Tell Us About Your Writing</h2>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="role" className={`block mb-2 text-sm font-medium truncate ${errors.role && touched.role ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {errors.role && touched.role ? `*${errors.role}` : <>What type of writer are you?<span className="text-red-500">*</span></>}
                                                </label>
                                                <Field
                                                    as="select"
                                                    name="role"
                                                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                                >
                                                    <option value="">Select your type</option>
                                                    {writerTypes.map((type) => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </Field>
                                            </div>

                                            <div>
                                                <label htmlFor="interests" className={`block mb-2 text-sm font-medium sm:text-xs ${errors.interests && touched.interests ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {errors.interests && touched.interests ? `*${errors.interests}` : <> What interests you?<span className="text-red-500">*</span></>}
                                                </label>
                                                <button
                                                    onClick={() => setShowInterests(!showInterests)}
                                                    className="w-full flex items-center justify-between p-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <span className="text-gray-600">
                                                        {values.interests.length ? `${values.interests.length} selected` : 'Select interests'}
                                                    </span>
                                                    {showInterests ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </button>

                                                {showInterests && (
                                                    <div className="mt-2 p-4 border-2 border-gray-200 rounded-lg max-h-60 overflow-auto">
                                                        <div className="flex flex-wrap gap-2">
                                                            {writingInterests.map((interest) => (
                                                                <button
                                                                    key={interest}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const currentInterests = values.interests as string[];
                                                                        const newInterests = currentInterests.includes(interest)
                                                                            ? currentInterests.filter(i => i !== interest)
                                                                            : [...currentInterests, interest];
                                                                        setFieldValue('interests', newInterests);
                                                                    }}

                                                                    className={`px-3 py-1 rounded-full text-sm transition-all ${(values.interests as string[]).includes(interest)
                                                                        ? 'bg-black text-white'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                                                        }`}
                                                                >
                                                                    {interest}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between">
                                            <button
                                                onClick={handleBack}
                                                className="flex items-center gap-2 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                                            >
                                                <ArrowLeft size={18} />
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        Begin Writing <Loader2 />
                                                    </>
                                                ) : (
                                                    <>
                                                        Begin Writing <Pen size={18} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Form>
                        )
                    }}
                </Formik>
            </div>
        </div>
    );
};

export default RegistrationPage;