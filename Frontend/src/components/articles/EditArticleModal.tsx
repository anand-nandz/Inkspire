import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
// import * as Yup from "yup";
import {
    Button,
    Input,
    Select,
    SelectItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Textarea,
} from "@nextui-org/react";
import { Upload, X } from "lucide-react";
import Cropper, { Area } from "react-easy-crop";
import { axiosInstance } from "../../config/api/axiosInstance";
import { ArticleStatus, writingInterests } from "../../utils/interfaces/types";
import { handleApiError } from "../../utils/helpers/HandleApiError";
import { showToastMessage } from "../../utils/helpers/toast";
import imageCompression from 'browser-image-compression';
import { CropArea, EditArticleModalProps, FormValues, IArticle } from "../../utils/interfaces/interfaces";
import { AxiosError } from "axios";
import { articleValidationSchema } from "../../utils/validations/articleFormValidation";



const EditArticleModal = React.memo<EditArticleModalProps>(({ 
    isOpen, 
    onClose, 
    article, 
    onSave 
}) => {
    const [coverImage, setCoverImage] = useState<string | null | ArrayBuffer>(article?.coverImage || null);
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
    const [showCropModal, setShowCropModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null)

    const formik = useFormik<FormValues>({
        initialValues: {
            title: article?.title || "",
            category: article?.category || "",
            status: article?.articleStatus || "",
            description: article?.description || "",
            content: article?.content || "",
            coverImage: article?.coverImage || ""
        },
        validationSchema: articleValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!article) return;

            try {
                const submitData = new FormData();
                submitData.append('title', values.title);
                submitData.append('category', values.category);
                submitData.append('status', values.status);
                submitData.append('description', values.description);
                submitData.append('content', values.content);

                if (imageFile) {
                    submitData.append('coverImage', imageFile);
                }

                const response = await axiosInstance.put(`/update-article/${article._id}`, submitData, {
                    withCredentials: true
                });

                if (response.data) {
                    showToastMessage('Article updated successfully', 'success');
                    const updatedArticle: IArticle = {
                        ...article,
                        title: values.title,
                        description: values.description,
                        content: values.content,
                        category: values.category,
                        articleStatus: values.status as ArticleStatus,
                        coverImage: coverImage as string || article.coverImage,
                    };
                    onSave(updatedArticle);
                    onClose();
                }
            } catch (error) {
                handleApiError(error as AxiosError);
            }
        }
    });

    useEffect(() => {
        if (article?.coverImage) {
          setCoverImage(article.coverImage);
        }
      }, [article]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
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
                const reader = new FileReader();
                reader.onload = () => {
                    setCoverImage(reader.result);
                    setShowCropModal(true);
                };
                reader.readAsDataURL(compressedImage);
            } catch (error) {
                console.error("Error handling image:", error);
                showToastMessage('Error handling image', 'error');
            }
        }
    };

    const handleCropComplete = (
        _: Area,
        croppedAreaPixels: CropArea
    ) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const createCroppedImage = async (
        imageSrc: string,
        pixelCrop: CropArea
    ): Promise<string> => {
        const image = new Image();
        image.src = imageSrc;
        const canvas = document.createElement("canvas");
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext("2d");

        return new Promise((resolve) => {
            image.onload = () => {
                ctx?.drawImage(
                    image,
                    pixelCrop.x,
                    pixelCrop.y,
                    pixelCrop.width,
                    pixelCrop.height,
                    0,
                    0,
                    pixelCrop.width,
                    pixelCrop.height
                );
                resolve(canvas.toDataURL("image/jpeg"));
            };
        });
    };

    const handleCropConfirm = async () => {
        if (coverImage && croppedAreaPixels) {
            try {
                const croppedImage = await createCroppedImage(coverImage.toString(), croppedAreaPixels);
                setCoverImage(croppedImage);
                setShowCropModal(false);
            } catch (error) {
                console.error("Error cropping image:", error);
            }
        }
    };

    const getErrorMessage = (fieldName: keyof FormValues): string => {
        if (formik.touched[fieldName] && formik.errors[fieldName]) {
            return formik.errors[fieldName] as string;
        }
        return "";
    };

    const handleSubmitButtonClick = () => {
        formik.handleSubmit();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="full">
                <ModalContent>
                    <ModalHeader>Edit Article</ModalHeader>
                    <ModalBody className="max-h-screen overflow-y-auto">
                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            <Input
                                label="Title"
                                name="title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isRequired
                                isInvalid={!!(formik.touched.title && formik.errors.title)}
                                errorMessage={getErrorMessage('title')}
                            />

                            <Input
                                label="Description"
                                name="description"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isRequired
                                isInvalid={!!(formik.touched.description && formik.errors.description)}
                                errorMessage={getErrorMessage('description')}
                            />

                            <Select
                                label="Category"
                                name="category"
                                selectedKeys={formik.values.category ? [formik.values.category] : []}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isRequired
                                isInvalid={!!(formik.touched.category && formik.errors.category)}
                                errorMessage={getErrorMessage('category')}
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
                                selectedKeys={formik.values.status ? [formik.values.status] : []}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isRequired
                                isInvalid={!!(formik.touched.status && formik.errors.status)}
                                errorMessage={getErrorMessage('status')}
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
                                isRequired
                                isInvalid={!!(formik.touched.content && formik.errors.content)}
                                errorMessage={getErrorMessage('content')}
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
                                    type="button"
                                >
                                    Change Cover Image
                                </Button>
                            </div>

                            {coverImage && (
                                <div className="relative w-full h-64">
                                    <img
                                        src={typeof coverImage === 'string' ? coverImage : coverImage.toString()}
                                        alt="Cover"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <Button
                                        isIconOnly
                                        className="absolute top-2 right-2"
                                        onPress={() => {
                                            setCoverImage(null);
                                            setImageFile(null);
                                        }}
                                        type="button"
                                    >
                                        <X size={20} />
                                    </Button>
                                </div>
                            )}
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="flat" onPress={onClose} type="button">
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleSubmitButtonClick} type="button">
                            Save Changes
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={showCropModal} onClose={() => setShowCropModal(false)} size="full">
                <ModalContent>
                    <ModalHeader>Crop Cover Image</ModalHeader>
                    <ModalBody>
                        <div className="relative h-96">
                            {coverImage && (
                                <Cropper
                                    image={coverImage.toString()}
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
                        <Button color="danger" variant="flat" onPress={() => setShowCropModal(false)} type="button">
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleCropConfirm} type="button">
                            Apply
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
});

export default EditArticleModal;