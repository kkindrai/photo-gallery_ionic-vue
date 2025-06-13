<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Photo Gallery</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <!-- Content Section -->
    <ion-content :fullscreen="true">
      <!-- The Foto Display Grid -->
      <ion-content>
        <ion-grid>
          <ion-row>
            <ion-col size="6" :key="photo.filepath" v-for="photo in photos">
              <ion-img :src="photo.webviewPath" @click="showActionSheet(photo)"></ion-img>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content> 
      
      <!-- Take Photo Camera Button -->
      <ion-fab vertical="bottom" horizontal="center" slot="fixed">
        <ion-fab-button @click="takePhoto()">
          <ion-icon :icon="camera"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
  import { camera, trash, close } from 'ionicons/icons';
  import { usePhotoGallery, UserPhoto } from '@/composables/usePhotoGallery';
  import { 
    actionSheetController,
    IonPage,
    IonHeader,
    IonFab,
    IonFabButton,
    IonIcon,
    IonToolbar,
    IonTitle,
    IonContent,
    IonImg,
    IonGrid,
    IonRow,
    IonCol,
  } from '@ionic/vue';

  // Destructure the takePhoto function from the composable
  const { photos, takePhoto, deletePhoto } = usePhotoGallery();

  // Running the Action Sheet Script
  const showActionSheet = async (photo: UserPhoto) => {
    const actionSheet = await actionSheetController.create({
      header: 'Photos',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: trash,
          handler: () => {
            deletePhoto(photo);
          },
        },
        {
          text: 'Cancel',
          icon: close,
          role: 'cancel',
          handler: () => {
            // Nothing to do, action sheet is automatically closed
          },
        },
      ],
    });
    await actionSheet.present();
  };
</script>
