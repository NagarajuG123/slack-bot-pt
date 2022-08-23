import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RollbarLogger } from 'nestjs-rollbar';
import { SlackApiService } from 'src/shared/services/slackapi.service';
import { MessageLogService } from '../message-log/message-log.service';
import { UserService } from '../user/user.service';
import { WorkspaceService } from '../workspace/workspace.service';

@Injectable()
export class WhatsappService{

    constructor(
        private _messageLogService : MessageLogService,
        private _userService : UserService,
        private _rollbarLogger : RollbarLogger,
        private _slackApiService : SlackApiService,
        private _workspaceService : WorkspaceService,
        private _configService : ConfigService
    ){}
    async processMessage(body){
        let {message,type} = body;
        const {from,content} = message;
        let user,workspace
            let saveMessageResponse = await this.saveMessage(message);

            if(saveMessageResponse){
                user = await this._userService.find({mobile_number:from.split('+91')[1]});
                workspace = await this._workspaceService.find({id:user[0].workspace_id})   
            }
            let response = await this._slackApiService.postBlockMessage(workspace.bot_access_token,user[0].availability_channel_id,content.text);
            // if(response.ok){
            //     await this.postAcknowledgement(message);
            // }
        
    }

    async saveMessage(message){
        const {from,content} = message;
        let senderNumber = from.split('+91')[1];
        let data = {
            message:content.text,
            sender_whatsapp:senderNumber
        }
        try{
            return await this._messageLogService.create(data);
        }catch(error){
            this._rollbarLogger.error(error);
        }
        
    } 
    
    
    // async postAcknowledgement(message){
    //     let {conversationId} = message;
    //     let mbAcessKey = this._configService.get('messageBirdKey');
    //     var messagebird = require('messagebird')(mbAcessKey);

    //     var params = {
    //         'type': 'text',
    //         'content': {
    //         'text': 'Your request is posted to Slack Successfully!'
    //         },
    //         "source": {
    //           "foo":"var"
    //         }
    //       }
          
    //       messagebird.conversations.reply(conversationId, params, function (err, response) {
    //         if (err) {
    //         return console.log(err);
    //         }
    //         console.log(response);
    //       });
    // }
}