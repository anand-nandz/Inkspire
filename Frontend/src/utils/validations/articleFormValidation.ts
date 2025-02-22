import * as Yup from 'yup';

export const articleValidationSchema = Yup.object({
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


// export const validationSchema = 
