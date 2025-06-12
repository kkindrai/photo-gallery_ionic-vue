import { ref, onMounted, watch } from 'vue';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
// Platform Specific Logic Imports
import { isPlatform } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';

/**
 * Function to handle photo gallery operations.
 * 
 * @returns takePhoto function that captures a photo using the device camera.
 */
export const usePhotoGallery = () => {

    // Local Instance Variables
    const PHOTO_STORAGE = 'photos';
    const photos = ref<UserPhoto[]>([]);


    // takePhoto Function
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

    // cachePhotos Function
    const cachePhotos = () => {
        Preferences.set({
            key: PHOTO_STORAGE,
            value: JSON.stringify(photos.value),
        });
    };

    /**
     * savePicture Function
     * * Fetches the photo, reads it as a blob, converts it to base64
     * 
     * * Returns the filename and webpath
     */
    const savePicture = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
        let base64Data: string | Blob;
        // "hybrid" will detect mobile - iOS or Android
        if (isPlatform('hybrid')) {
            const file = await Filesystem.readFile({
            path: photo.path!,
            });
            base64Data = file.data;
        } else {
            // Fetch the photo, read as a blob, then convert to base64 format
            const response = await fetch(photo.webPath!);
            const blob = await response.blob();
            base64Data = (await convertBlobToBase64(blob)) as string;
        }
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Data,
        });

        if (isPlatform('hybrid')) {
            // Display the new image by rewriting the 'file://' path to HTTP
            // Details: https://ionicframework.com/docs/building/webview#file-protocol
            return {
            filepath: savedFile.uri,
            webviewPath: Capacitor.convertFileSrc(savedFile.uri),
            };
        } else {
            // Use webPath to display the new image instead of base64 since it's
            // already loaded into memory
            return {
            filepath: fileName,
            webviewPath: photo.webPath,
            };
        }
    };

    /**
     * loadSaved Function
     * * Loads saved photos from Preferences and converts them to UserPhoto objects.
     */
    const loadSaved = async () => {
        const photoList = await Preferences.get({ key: PHOTO_STORAGE });
        const photosInPreferences = photoList.value ? JSON.parse(photoList.value) : [];

        for (const photo of photosInPreferences) {
            const file = await Filesystem.readFile({
            path: photo.filepath,
            directory: Directory.Data,
            });
            photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
        }

        photos.value = photosInPreferences;
    };

    // Watching for changes in photos array to cache them
    watch(photos, cachePhotos);
    // Running onMounted to load saved photos
    onMounted(loadSaved);

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

  