import Model from './model/Model';

const inquirer = require('inquirer');

export default class ProfileHelper {

  private _appModel: Model;

  public userId: string = '';
  public userPassword: string = '';

  constructor(appModel: Model) {
    this._appModel = appModel;
  }

  create(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const questions: any[] = [
        {
          type: 'input',
          name: 'userId',
          message: `What is the user id?:\n`
        },
        {
          type: 'input',
          name: 'userPassword',
          message: `What is user password?:\n`,
        },
        {
          type: 'input',
          name: 'profileId',
          message: `Provide a name (id) for the new profile:\n`,
        },
        {
          type: 'list',
          name: 'confirm',
          choices: ['yes', 'no'],
          message: `Confirm: Create this new profile?:\n`,
        }
      ]
      inquirer.prompt(questions).then((result: any) => {
        // console.log(result);
        if (result.confirm === 'yes') {
          const newProfile = this._appModel.profiles.newProfile(result.profileId);
          if (newProfile) {
            newProfile.data.userId = result.userId;
            newProfile.data.userPassword = result.userPassword;
          }
          resolve(newProfile);
        } else {
          resolve('new profile canceled.')
        }
      });
    });
  }

  dispose() {
  }
}