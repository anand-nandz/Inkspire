import { useState, useEffect } from "react"
import { Button, Card, CardBody, CardHeader, Input } from "@nextui-org/react"
import { ArrowLeft } from "lucide-react"
import { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"
import { axiosInstance } from "../../config/api/axiosInstance"
import { handleApiError } from "../../utils/helpers/HandleApiError"
import { showToastMessage } from "../../utils/helpers/toast"

export default function OTPVerification() {
    const [otp, setOtp] = useState("")
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const otpData = localStorage.getItem('otpData')

        if (!otpData) {
            navigate('/signup')
            return
        }

        const { otpExpiry } = JSON.parse(otpData)

        const startTimer = () => {
            const now = Date.now()
            if (otpExpiry > now) {
                setTimeLeft(Math.floor((otpExpiry - now) / 1000))

                const interval = setInterval(() => {
                    const currentTime = Date.now()
                    if (otpExpiry > currentTime) {
                        setTimeLeft(Math.floor((otpExpiry - currentTime) / 1000))
                    } else {
                        setTimeLeft(0)
                        localStorage.removeItem('otpData')
                        navigate('/signup')
                        clearInterval(interval)
                    }
                }, 1000)

                return () => clearInterval(interval)
            } else {
                setTimeLeft(0)
                localStorage.removeItem('otpData')
                navigate('/signup')
            }
        }

        startTimer()
    }, [navigate])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (isNaN(Number(value))) return;
        if (value.length <= 4) {
            setOtp(value);
        }
    };

    const handleVerify = async () => {
        setIsLoading(true)
        try {
            const otpData = localStorage.getItem('otpData')

            if (!otpData) {
                navigate('/signup')
                return
            }

            const response = await axiosInstance.post('/verifyOtp', { otp })
            console.log(response.data);
            showToastMessage(response.data.message, 'success');

            if (response.data.user) {
                localStorage.removeItem('otpData')
                navigate('/login')
            }
        } catch (error) {
            handleApiError(error as AxiosError);
        } finally {
            setIsLoading(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-8">
                    <Button
                        variant="light"
                        startContent={<ArrowLeft className="w-4 h-4" />}
                        className="mb-4"
                        onClick={() => navigate('/signup')}
                    >
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold">
                        Ink<span className="text-gray-500">Spire</span>
                    </h1>
                </div>

                <Card className="w-full">
                    <CardHeader className="flex flex-col gap-1 px-8 pt-8">
                        <h4 className="text-xl font-bold">Verify OTP</h4>
                        <p className="text-sm text-gray-500">
                            Please enter the verification code to confirm your account.
                        </p>
                    </CardHeader>
                    <CardBody className="px-8 pb-8">
                        <div className="flex flex-col gap-6">
                            <Input
                                type="text"
                                maxLength={4}
                                value={otp}
                                placeholder="Enter 4-digit OTP"
                                className="mt-4 border p-2"
                                classNames={{
                                    input: "text-center text-lg",
                                }}
                                onChange={handleChange}
                            />

                            {timeLeft !== null && (
                                <p className="text-center text-sm text-gray-500">
                                    {timeLeft > 0
                                        ? `Time remaining: ${formatTime(timeLeft)}`
                                        : "OTP has expired"}
                                </p>
                            )}

                            <Button
                                color="primary"
                                className="w-full p-2  bg-black text-white"
                                size="lg"
                                onClick={handleVerify}
                                isDisabled={isLoading || !timeLeft || timeLeft === 0 || otp.length !== 4}
                            >
                                {isLoading ? "Verifying..." : "Verify OTP"}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}