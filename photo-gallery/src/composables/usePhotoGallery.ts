import { ref, onMounted, watch } from 'vue';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

/**
 * Instance Variables
 * * photos: A reactive reference to store user photos.
 */
const photos = ref<UserPhoto[]>([]);

/**
 * Function to handle photo gallery operations.
 * 
 * @returns takePhoto function that captures a photo using the device camera.
 */
export const usePhotoGallery = () => {
  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const fileName = Date.now() + '.jpeg';
    const savedFileImage = await savePicture(photo, fileName);

    photos.value = [savedFileImage, ...photos.value];
  };

  return {
    photos,
    takePhoto,
  };
};

/**
 * UserPhoto Interface
 * * Represents a photo taken by the user.
 * 
 */
export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

/**
 * Helper Function for the Filesystem API
 */
const convertBlobToBase64 = (blob: Blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  /**
   * savePicture Function
   * * Fetches the photo, reads it as a blob, converts it to base64
   * 
   * * Returns the filename and webpath
   */
  const savePicture = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    const base64Data = (await convertBlobToBase64(blob)) as string;

    const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data,
    });

    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return {
        filepath: fileName,
        webviewPath: photo.webPath,
    };
};