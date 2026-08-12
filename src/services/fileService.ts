import type { Message } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fileService = {
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<{ message: Message }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/files/upload`);
      xhr.withCredentials = true;

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              resolve({ message: response.data.message });
            } else {
              reject(new Error(response.message || 'Upload failed'));
            }
          } catch (e) {
            reject(new Error('Invalid response'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  },

  async getMediaVault(): Promise<any[]> {
    const res = await fetch(`${API_URL}/files/vault`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch vault');
    }
    return data.data.files;
  },

  async deleteFile(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/files/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete file');
    }
  },

  getFileUrl(id: string): string {
    return `${API_URL}/files/${id}`;
  }
};
