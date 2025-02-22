
import React, { useRef, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import {
    Button,
    Input,
    Select,
    SelectItem,
    Card,
    CardBody,
    Textarea,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@nextui-org/react"
import { Upload, X } from "lucide-react"
import Cropper, { Area } from "react-easy-crop"
import { axiosInstance } from "../../config/api/axiosInstance"
import { ArticleStatus, writingInterests } from "../../utils/interfaces/types"
import { handleApiError } from "../../utils/helpers/HandleApiError"
import { AxiosError } from "axios"
import { showToastMessage } from "../../utils/helpers/toast"
import imageCompression from 'browser-image-compression';
import { useNavigate } from "react-router-dom"
import { USER } from "../../utils/constants/constants"
import { CropArea } from "../../utils/interfaces/interfaces"

const validationSchema = Yup.object({
    title: Yup.string()
        .required('Title is required')
        .min(3, 'Title must be at least 3 characters'),
    description: Yup.string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters'),
    content: Yup.string()
        .required('Content is required')
        .min(50, 'Content must be at least 50 characters'),
    category: Yup.string()
        .required('Please select a category'),
    status: Yup.string()
        .oneOf(['Draft', 'Published'], 'Invalid status')
        .required('Please select a status'),
    coverImage: Yup.string()
        .required('Cover image is required'),
});

const CreateArticle = () => {
    const [coverImage, setCoverImage] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const navigate = useNavigate()
    const formik = useFormik({
        initialValues: {
            title: "",
            category: "",
            status: "",
            description: "",
            content: "",
            coverImage: "",  
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                console.log(values,'values');
                const submitData = new FormData()
                submitData.append('title', values.title)
                submitData.append('category', values.category)
                submitData.append('status', values.status)
                submitData.append('description', values.description)
                submitData.append('content', values.content)
                if (imageFile) {
                    submitData.append('coverImage', imageFile)
                }
                const response = await axiosInstance.post('/create-article', submitData, {
                    withCredentials: true
                })
                console.log(response.data);
                if(response.data){
                    showToastMessage(response.data.message,'success')
                    navigate('/articles')
                }
            } catch (error) {
                handleApiError(error as AxiosError)
            }
        }
    })

    const handleImageUpload = async(event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
           try {
            const compressedImage = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1280,
                useWebWorker: true
            })
            
            const compressedFile = new File([compressedImage], file.name, {
                type: file.type,
                lastModified: Date.now()
            })

            setImageFile(compressedFile)

            const reader = new FileReader()
            reader.onload = () => {
                const result = reader.result as string
                setCoverImage(result)
                onOpen()
            }
            reader.readAsDataURL(compressedImage)
           } catch (error) {
            console.error("Error handling image:", error)
            showToastMessage('Error handling images','error')
           }
        }
    }

    const handleCropComplete = (_croppedArea: Area, croppedAreaPixels: CropArea) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const createCroppedImage = async (
        imageSrc: string,
        pixelCrop: CropArea
    ): Promise<string> => {
        const image = new Image()
        image.src = imageSrc

        const canvas = document.createElement("canvas")
        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height
        const ctx = canvas.getContext("2d")

        return new Promise((resolve) => {
            image.onload = () => {
                if (ctx) {
                    ctx.drawImage(
                        image,
                        pixelCrop.x,
                        pixelCrop.y,
                        pixelCrop.width,
                        pixelCrop.height,
                        0,
                        0,
                        pixelCrop.width,
                        pixelCrop.height
                    )
                }
                resolve(canvas.toDataURL("image/jpeg"))
            }
        })
    }

    const handleCropConfirm = async () => {
        if (coverImage && croppedAreaPixels) {
            try {
                const croppedImage = await createCroppedImage(coverImage, croppedAreaPixels)
                setCoverImage(croppedImage)
                formik.setFieldValue('coverImage', croppedImage)
                onClose()
            } catch (error) {
                console.error("Error cropping image:", error)
            }
        }
    }

    const handleCancel = ()=>{
        formik.resetForm()
        navigate(USER.ARTICLE)
    }

    return (
        <div className="max-w-4xl mt-10 mx-auto p-6">
            <Card>
                <CardBody className="space-y-6">
                    <h1 className="text-2xl font-bold">Create New Article</h1>

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <Input
                            label="Title"
                            name="title"
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="max-w-full"
                            isRequired
                            isInvalid={!!(formik.touched.title && formik.errors.title)}
                            errorMessage={formik.touched.title && formik.errors.title}
                        />
                        
                        <Input
                            label="Description"
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="max-w-full"
                            isRequired
                            isInvalid={!!(formik.touched.description && formik.errors.description)}
                            errorMessage={formik.touched.description && formik.errors.description}
                        />

                        <Select
                            label="Category"
                            name="category"
                            value={formik.values.category}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isRequired
                            isInvalid={!!(formik.touched.category && formik.errors.category)}
                            errorMessage={formik.touched.category && formik.errors.category}
                        >
                            {writingInterests.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </Select>

                        <Select
                            label="Status"
                            name="status"
                            value={formik.values.status}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isRequired
                            isInvalid={!!(formik.touched.status && formik.errors.status)}
                            errorMessage={formik.touched.status && formik.errors.status}
                        >
                            {Object.values(ArticleStatus)
                                .filter((val) => val === ArticleStatus.Draft || val === ArticleStatus.Published)
                                .map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                        </Select>

                        <Textarea
                            label="Content"
                            name="content"
                            value={formik.values.content}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            minRows={5}
                            className="max-w-full"
                            isRequired
                            isInvalid={!!(formik.touched.content && formik.errors.content)}
                            errorMessage={formik.touched.content && formik.errors.content}
                        />

                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <Button
                                startContent={<Upload size={20} />}
                                onPress={() => fileInputRef.current?.click()}
                            >
                                Upload Cover Image
                            </Button>
                            {formik.touched.coverImage && formik.errors.coverImage && (
                                <div className="text-danger mt-1">{formik.errors.coverImage}</div>
                            )}
                        </div>

                        {coverImage && (
                            <div className="relative w-full h-64">
                                <img
                                    src={coverImage}
                                    alt="Cover"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                <Button
                                    isIconOnly
                                    className="absolute top-2 right-2"
                                    onPress={() => {
                                        setCoverImage(null)
                                        formik.setFieldValue('coverImage', '')
                                    }}
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button 
                                type="button" 
                                color="default" 
                                variant="flat"
                                onPress={handleCancel}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                color="primary"
                                isDisabled={!formik.isValid || formik.isSubmitting}
                            >
                                Create Article
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    <ModalHeader>Crop Cover Image</ModalHeader>
                    <ModalBody>
                        <div className="relative h-[400px]">
                            {coverImage && (
                                <Cropper
                                    image={coverImage}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={16 / 9}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={handleCropComplete}
                                />
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="flat" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleCropConfirm}>
                            Apply
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default CreateArticle

