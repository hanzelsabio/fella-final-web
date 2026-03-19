import api from "./api";

export const uploadAPI = {
  uploadImage: (file, folder = "products") => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        api
          .post("/upload/image", {
            image: reader.result,
            folder,
          })
          .then(resolve)
          .catch(reject);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};
