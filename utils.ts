export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // result is "data:image/png;base64,iVBORw0KGgo..."
      // we need to strip the prefix "data:image/png;base64,"
      if (typeof reader.result !== 'string') {
        return reject(new Error('FileReader result is not a string'));
      }
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};
