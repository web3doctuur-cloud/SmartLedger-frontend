import type { AxiosResponse } from 'axios';

const CONTENT_DISPOSITION_FILENAME_REGEX =
  /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i;

export const getDownloadFilename = (
  contentDisposition: string | undefined,
  fallbackName: string
) => {
  if (!contentDisposition) {
    return fallbackName;
  }

  const match = CONTENT_DISPOSITION_FILENAME_REGEX.exec(contentDisposition);
  const encodedFilename = match?.[1];
  const plainFilename = match?.[2];
  const candidate = encodedFilename || plainFilename;

  if (!candidate) {
    return fallbackName;
  }

  try {
    return decodeURIComponent(candidate.replace(/^"|"$/g, ''));
  } catch {
    return candidate.replace(/^"|"$/g, '');
  }
};

export const downloadResponseFile = (
  response: AxiosResponse<Blob | ArrayBuffer | string>,
  fallbackName: string
) => {
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
  const fileName = getDownloadFilename(
    response.headers?.['content-disposition'],
    fallbackName
  );

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
