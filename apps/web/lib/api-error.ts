import axios from 'axios';

type ApiErrorIssue = {
  path?: string;
  message?: string;
};

type ApiErrorPayload = {
  error?: {
    message?: string;
    details?: {
      issues?: ApiErrorIssue[];
    };
  };
};

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const firstIssueMessage = error.response?.data?.error?.details?.issues?.[0]?.message;
    if (typeof firstIssueMessage === 'string' && firstIssueMessage.trim()) {
      return firstIssueMessage;
    }

    const apiMessage = error.response?.data?.error?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim()) {
      return apiMessage;
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Unable to reach the administrator service right now.';
    }
  }

  return fallbackMessage;
}
