"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require('inquirer');
class ProfileHelper {
    constructor(appModel) {
        this.userId = '';
        this.userPassword = '';
        this._appModel = appModel;
    }
    create() {
        return new Promise((resolve, reject) => {
            const questions = [
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
            ];
            inquirer.prompt(questions).then((result) => {
                // console.log(result);
                if (result.confirm === 'yes') {
                    const newProfile = this._appModel.profiles.newProfile(result.profileId);
                    if (newProfile) {
                        newProfile.data.userId = result.userId;
                        newProfile.data.userPassword = result.userPassword;
                    }
                    resolve(newProfile);
                }
                else {
                    resolve('new profile canceled.');
                }
            });
        });
    }
    dispose() {
    }
}
exports.default = ProfileHelper;
//# sourceMappingURL=ProfileHelper.js.map