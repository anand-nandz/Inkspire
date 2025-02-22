import type React from "react"
import { useState } from "react"
import {
    Card,
    CardBody,
    Button,
    Input,
    Select,
    SelectItem,
    Chip,
    Checkbox,
    Tabs,
    Tab,
    ScrollShadow,
} from "@nextui-org/react"
import {
    Avatar,
} from '@mui/material';
import { Loader, LogOut } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { AxiosError } from "axios"
import UserRootState from "../../redux/rootstate/UserState"
import { AccountInfo } from "../../utils/interfaces/interfaces"
import { showToastMessage } from "../../utils/helpers/toast"
import { setUserInfo } from "../../redux/slices/UserSlice"
import { handleApiError } from "../../utils/helpers/HandleApiError"
import { axiosInstance } from "../../config/api/axiosInstance"
import { writerTypes, writingInterests } from "../../utils/interfaces/types"
import imageCompression from 'browser-image-compression';


const UserProfile: React.FC = () => {
    const userInfo = useSelector((state: UserRootState) => state.user.userData);
    const [previewUrl, setPreviewUrl] = useState<string | null>(userInfo?.profileImage || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<AccountInfo>({
        firstName: userInfo?.firstName || "",
        lastName: userInfo?.lastName || "",
        profileImage: userInfo?.profileImage || "",
        dob: userInfo?.dob || "",
        role: userInfo?.role || "",
        interests: userInfo?.interests || [],
    })
    const dispatch = useDispatch();

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            try {
                const compressedImage = await imageCompression(file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1280,
                    useWebWorker: true
                });
                const compressedFile = new File([compressedImage], file.name, {
                    type: file.type,
                    lastModified: Date.now()
                });

                setImageFile(compressedFile);
                setIsEditing(prev => ({ ...prev, profileImage: true }));
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(compressedImage);
            } catch (error) {
                console.error('Error compressing image:', error);
                showToastMessage('Error compressing image', 'error');
            }
        }
    };

    const handleInputChange = (field: keyof AccountInfo, value: string | string[]) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        setIsEditing((prev) => ({
            ...prev,
            [field]: true,
        }))
    }

    const handleInterestToggle = (interest: string) => {
        const newInterests = formData.interests.includes(interest)
            ? formData.interests.filter((i) => i !== interest)
            : [...formData.interests, interest];

        handleInputChange("interests", newInterests)
    }

    const handleSubmit = async () => {
        if (isSubmitting) return;
        try {
            setIsSubmitting(true);
            const submitData = new FormData()
            if (imageFile && isEditing.profileImage) {
                submitData.append('profileImage', imageFile);
            }

            Object.entries(formData).forEach(([key, value]) => {
                if (isEditing[key] && key !== 'profileImage') {
                    if (key === 'interests' && Array.isArray(value)) {
                        value.forEach(interest => {
                            submitData.append('interests[]', interest);
                        });
                    } else if (value !== undefined && value !== null) {
                        submitData.append(key, String(value));
                    }
                }
            });
            
            const response = await axiosInstance.put(`/profile`, submitData, {
                withCredentials: true,
            })
            if (response?.data) {
                showToastMessage(response.data.message, 'success')
                dispatch(setUserInfo(response.data.user))
                setIsEditing({})
            }
        } catch (error) {
            handleApiError(error as AxiosError)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 mt-12">
            <Card className="bg-background/60 backdrop-blur-lg">
                <CardBody className="p-6">
                    <Tabs aria-label="Profile sections" className="flex justify-center">
                        <Tab key="personal" title="Personal Information" >
                            <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 py-4 ">
                                <div className="space-y-4 flex flex-col items-center"> 
                                    <div className="relative flex flex-col items-center"> 
                                        <input
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            id="image-upload"
                                            type="file"
                                            onChange={handleImageChange}
                                        />
                                        <label htmlFor="image-upload">
                                            <Avatar
                                                src={previewUrl || userInfo?.profileImage || "/api/placeholder/128/128"}
                                                sx={{
                                                    width: 148,
                                                    height: 148,
                                                    mb: 2,
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                        opacity: 0.8,
                                                    },
                                                }}
                                            />
                                        </label>
                                        {isEditing.profileImage && (
                                            <div className="mt-2 text-xs text-gray-500 text-center">
                                                Click Save Changes to update your profile picture
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        color="default"
                                        variant="flat"
                                        startContent={<LogOut className="w-4 h-4" />}
                                        className="w-full"
                                    >
                                        Logout
                                    </Button>
                                </div>


                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="First Name"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                            variant="bordered"
                                        />
                                        <Input
                                            label="Last Name"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            variant="bordered"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            type="date"
                                            label="Date of Birth"
                                            value={formData.dob}
                                            onChange={(e) => handleInputChange("dob", e.target.value)}
                                            variant="bordered"
                                        />
                                        <Select
                                            label="Role"
                                            selectedKeys={formData.role ? [formData.role] : []}
                                            onChange={(e) => handleInputChange("role", e.target.value)}
                                            variant="bordered"
                                        >
                                            {writerTypes.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Interests</p>
                                        <ScrollShadow className="h-[200px]">
                                            <div className="grid grid-cols-2 gap-2">
                                                {writingInterests.map((interest) => (
                                                    <Checkbox
                                                        key={interest}
                                                        isSelected={formData.interests.includes(interest)}
                                                        onValueChange={() => handleInterestToggle(interest)}
                                                    >
                                                        {interest}
                                                    </Checkbox>
                                                ))}
                                            </div>
                                        </ScrollShadow>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.interests.map((interest) => (
                                                <Chip key={interest} variant="flat" onClose={() => handleInterestToggle(interest)}>
                                                    {interest}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>

                                    {Object.values(isEditing).some(Boolean) && (
                                        <div className="flex justify-end">
                                            <Button color="primary" onClick={handleSubmit}>
                                                {isSubmitting ?
                                                    <>
                                                        Save Changes
                                                        <Loader />
                                                    </>
                                                    : ` Save Changes`}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </CardBody>
            </Card>
        </div>
    )
}

export default UserProfile

