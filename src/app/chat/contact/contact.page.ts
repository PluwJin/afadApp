import { Component, OnInit } from '@angular/core';
import { ContactServiceService } from "../../services/contactService/contact-service.service";
import { Contacts, Contact,ContactFieldType } from '@ionic-native/contacts/ngx';
import { BleService } from "../../services/BLE/ble.service";
import {FirestoreServiceService} from '../../services/firebase/firestore-service.service';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingController } from '@ionic/angular';
import { AuthenticationService } from "../../services/authentication/authentication.service";
import { Router } from "@angular/router";
import { Platform } from "@ionic/angular";
import { RealtimedbService } from "../../services/realtimeDB/realtimedb.service";
import { BackgroundMode } from '@ionic-native/background-mode/ngx';







@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  contactsFound:Contact[]=[];
  appContacts:Contact[]=[];
  showing:number[]=[];
  devices:any[]=[];
  contactImages:any[]=[];
  loading;
  lastOnlineTime;
  unSeenMessages;


  constructor(private contactService:ContactServiceService,
              private ble:BleService,
              private fs:FirestoreServiceService,
              private rdb:RealtimedbService,
              private loadingController:LoadingController,
              private auth:AuthenticationService,
              private router:Router,
              private plt:Platform,
              private bgm:BackgroundMode) { }

  ngOnInit() {  
    this.auth.getLastOnlineTime().then(res =>{
      this.lastOnlineTime=res;
      this.checkIsRegister();
    })
    this.plt.pause.subscribe(()=>{
      this.auth.writeLastOnlineTime();
    });
    this.plt.resume.subscribe(()=>{
      this.auth.removeLastOnlineTime();
    });
    this.appContacts=[];
    this.loadAppContact();
  }

  checkIsRegister(){
    console.log("Giris Kontrolü Yapılıyor.");
    this.plt.ready().then(()=>{
      this.auth.isRegister().then(res =>{
        console.log("Kullanıcı Girisi:"+res);
        if(!res){
          console.log("Giris Kontrolü Yapıldı");
          this.goto();
        }else{
          console.log("Giris Kontrolü Yapıldı");
          this.rdb.listenForMessage(true);
          console.log(this.lastOnlineTime);
          this.unSeenMessages=[];
          this.rdb.getOfflineMessages(this.lastOnlineTime).subscribe(res=>{
            this.unSeenMessages=res;
            console.log("Unseen Messages",this.unSeenMessages);
          });//unsubscribe edilmeli


        }
      });
    });
  }
  goto(){
    this.router.navigate(['chat/login']);
  }

  revealNumber(contactId:number){
    console.log(contactId);
      let element=this.showing.indexOf(contactId);
    if(element==-1)
      this.showing.push(contactId);
    else if(element>-1)
      this.showing.splice(element,1);

  }
  getDevices(){
    this.ble.scan();
    this.devices=this.ble.devices;
  }

  goToChat(){
    console.log("Kullanıcı ile Chat kısmına geçecek UUID yi parametre olarak alabilir.")

  }
  loadContact(){
    if(this.contactsFound.length>0){
      this.contactsFound=[];
    }
    else{
      this.contactService.getContacts().then((contacts: Contact[]) =>{
        this.contactsFound=contacts;
      });
    }
  }
  loadAppContact(){
    this.presentLoading();
    console.log("loadAppContact");
    this.appContacts=this.fs.getUser();

  }

  async presentLoading() {
    this.loading= await this.loadingController.create({
      message: 'Lütfen Bekleyin',
    }).then(res =>{
      res.present();
      setTimeout(() => {
        res.dismiss();
      }, 2000);
    })
  }

  
}
