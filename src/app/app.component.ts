import { Component } from '@angular/core';
import { CapacitorConfig } from '@capacitor/cli';
import { Capacitor } from '@capacitor/core';
import { Plugins } from '@capacitor/core';
const { LocalNotifications } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    const config: CapacitorConfig = {
      plugins: {
        LocalNotifications: {
          presentationOptions: ['badge', 'sound', 'alert'],
        },
      },
    };
    // this.notificationChannel();
    const isPushNotificationsAvailable =
      Capacitor.isPluginAvailable('PushNotifications');

    if (isPushNotificationsAvailable) {
      // this.initPushNotifications();
      // this.pushNotificatinFun();
    }
  }

  pushNotificatinFun() {
    // PushNotifications.requestPermissions().then(result => {
    //   if (result.receive === 'granted') {
    //     PushNotifications.register();
    //     this.notificationChannel();
    //   } else {
    //     this.pushNotificatinFun();
    //   }
    // });
    //   PushNotifications.addListener('registration', (token: Token) => {
    //   });
    //   PushNotifications.addListener('registrationError', (error: any) => {
    //   });
    //   PushNotifications.addListener(
    //     'pushNotificationReceived',
    //     async (notification: PushNotificationSchema) => {
    //       const tkn = localStorage.getItem('token');
    //       if (notification.id && tkn) {
    //         this.showNotificaion = true;
    //         this.playSound();
    //         this.cd.detectChanges();
    //       }
    //     },
    //   );
    //   PushNotifications.addListener(
    //     'pushNotificationActionPerformed',
    //     (notification: ActionPerformed) => {
    //       this.storeNotificationID(notification.notification.data._id);
    //     },
    //   );
  }

  notificationChannel() {
    LocalNotifications['createChannel']({
      description: 'WeAre',
      id: 'WeAre',
      importance: 5,
      lights: true,
      name: 'WeAre',
      sound: '../assets/audio/azan.wav',
      vibration: true,
      visibility: 1,
    }).then(
      (channelResult: any) => {},
      (err: any) => {
        console.error(err);
      }
    );
  }
}
