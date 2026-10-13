import { Injectable } from '@angular/core';
import {
  ToastController,
  LoadingController,
  ModalController,
  AlertController,
} from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  activeLoaders: any[] = [];
  activeToasts: any[] = [];

  constructor(
    public modalCtrl: ModalController,
    public alertController: AlertController,
    private loadingCtrl: LoadingController,
    private toastController: ToastController
  ) {}

  async presentToast(
    position: 'top' | 'middle' | 'bottom',
    msg: string = 'Give Some Text!',
    color = 'danger'
  ) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1000,
      position: position,
      color: color,
    });

    await toast.present();
    this.activeToasts.push(toast);
  }

  async showLoading(msg: string, duration: number) {
    const currentLoader = await this.loadingCtrl.getTop();

    if (!currentLoader) {
      // No loader is present, so we can present a new one
      const loading = await this.loadingCtrl.create({
        message: msg,
        spinner: 'crescent', // Optional: Choose spinner type
        duration: duration,
      });
      await loading.present();
      this.activeLoaders.push(loading);

      setTimeout(() => this.clearUtilServices(), 5000);
    } else {
      console.log('Loader is already presented.');
      this.clearUtilServices();
    }

    // setTimeout(async () => {
    //   // this.loadingDismiss();
    //   let ale = this.alertController.getTop();
    //   (await ale) ? this.alertController.dismiss() : false;
    //   let md = this.modalCtrl.getTop();
    //   (await md) ? this.modalCtrl.dismiss() : false;
    // }, 3000);
  }

  async loadingDismiss() {
    let ld = this.loadingCtrl.getTop();
    (await ld) ? this.loadingCtrl.dismiss() : false;
  }

  async clearUtilServices() {
    try {
      // Dismiss all active loaders
      for (const loader of this.activeLoaders) {
        await loader.dismiss();
      }
      this.activeLoaders = []; // Clear the list after dismissing

      // Dismiss all active toasts
      for (const toast of this.activeToasts) {
        await toast.dismiss();
      }
      this.activeToasts = []; // Clear the list after dismissing
    } catch (error) {
      console.error('Error dismissing all loaders or toasts:', error);
    }
  }
}
