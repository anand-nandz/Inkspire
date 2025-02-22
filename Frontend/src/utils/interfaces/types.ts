import { AxiosInstance } from 'axios';

export type CreateAxiosInstance = (
    baseUrl: string,
    tokenKey: string,
    refreshTokenKey: string
) => AxiosInstance;



export const toastStyles = `
.Toastify__toast {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
  border: 2px solid #000000;
  border-radius: 4px;
}

.Toastify__toast-icon {
  width: 20px;
  height: 20px;
}

.Toastify__close-button {
  color: #ffffff !important;
  opacity: 0.7;
}

.Toastify__close-button:hover {
  opacity: 1;
}

.Toastify__progress-bar {
  background: #404040 !important;
}

.Toastify__toast--success .Toastify__progress-bar {
  background: #2f855a !important;
}

.Toastify__toast--error .Toastify__progress-bar {
  background: #c53030 !important;
}
`;


export const writerTypes = [
    "Journalist",
    "Content Writer",
    "Creator",
    "Novelist",
    "Poet",
    "Academic Writer",
    "Screenwriter",
    "Blogger",
    "Technical Writer",
    "Essayist",
    "Ghostwriter",
    "Editorial Writer",
    "Investigative Journalist"
];

export const writingInterests = [
  "Poetry",
  "Biography",
  "Narrative",
  "Journalism",
  "Technology",
  "Business",
  "Health",
  "Education",
  "Travel",
  "Science",
  "Politics",
  "History",
  "Finance",
  "Psychology",
  "Philosophy",
  "Environment",
  "Futurism",
  "Sports",
  "Entertainment",
  "Lifestyle",
  "Culture"
];


export enum ArticleStatus {
  Draft = 'Draft',
  Published = 'Published',
  Archived = 'Archived',
  Blocked = 'Blocked',
  Delete = 'Deleted'
}
