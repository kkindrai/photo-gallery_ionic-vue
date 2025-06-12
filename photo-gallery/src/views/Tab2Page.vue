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
              <ion-img :src="photo.webviewPath"></ion-img>
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
  import { watch } from 'vue';
  import { camera, trash, close } from 'ionicons/icons';
  import { usePhotoGallery, UserPhoto } from '@/composables/usePhotoGallery';
  import { 
    IonPage,
    IonHeader,
    IonFab,
    IonFabButton,
    IonIcon,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
  } from '@ionic/vue';

  // Destructure the takePhoto function from the composable
  const { photos, takePhoto, cachePhotos } = usePhotoGallery();
  // Watching for changes in the photo array to cache them
  watch(photos, cachePhotos);
</script>
