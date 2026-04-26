type successResponse<T> = {
  success: true;
  data: T;
  error: null;
};

type errorResponse = {
  success: false;
  data: null;
  error: {
    message: string;
    code: string;
    details?: any;
  };
};

export const successResponse = <T>(data: T): successResponse<T> => ({
  success: true,
  data,
  error: null,
});

export const errorResponse = (
  message: string,
  code?: string,
  details?: any,
): errorResponse => ({
  success: false,
  data: null,
  error: {
    message,
    code: code || "ERROR",
    details,
  },
});
