import { Component, OnInit, ViewChild } from '@angular/core';
import { AutosizeModule } from "ngx-autosize";
import { IonContent } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { RealtimedbService } from "../../services/realtimeDB/realtimedb.service";
import { Resolve, ActivatedRouteSnapshot, ActivatedRoute  } from '@angular/router';
import { SQLiteService,message } from "../../services/SQLite/sqlite.service";




@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {

  //messages=[];
  messages:message[]=[];
  to;
  from="+905389640431"; //Değiştir. current user
  newMessage='';
  @ViewChild(IonContent,null) content: IonContent;

  constructor(private keyboard:Keyboard,
              private rdb:RealtimedbService,
              private route:ActivatedRoute,
              private sqliteService:SQLiteService) { 

    this.to=this.route.snapshot.paramMap.get('to');
    console.log("Kime",this.to); 
  }

  resolve(route: ActivatedRouteSnapshot) {
    let id = route.paramMap.get('id');
  }

  ngOnInit() {
    this.loadMessages()
    window.addEventListener('keyboardWillShow', (event) => {
      this.content.scrollToBottom(200);
  });
  }

  sendMessage(){
    let createdAt=new Date().getTime();
    let msg={
      to:this.to,
      from:this.from,
      createdAt:createdAt,
      message:this.newMessage
    };
    this.rdb.sendMessage(this.to,this.from,this.newMessage,createdAt).then(()=>{
      this.messages.push(msg);
      this.sqliteService.addMessage(msg);
      this.newMessage='';
      setTimeout(()=>{
        this.content.scrollToBottom(200);
      });
    }) 
  }
  

  loadMessages(){
    this.sqliteService.getDatabaseState().subscribe(ready => {
      if(ready){

        this.sqliteService.loadMessages(this.to,this.from);
        this.sqliteService.getMessages().subscribe(messages =>{
          this.messages=messages;
        })
        console.log("Mesajlar Alindi");
      }
    })
  }

}
