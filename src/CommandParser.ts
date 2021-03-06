import { EventEmitter } from 'events';
import Model from './model/Model';
import Profile from './model/Profile';
import CommandResponse, { CommandState } from './CommandResponse';
import ProfileHelper from './ProfileHelper';

const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const jsonfile = require('jsonfile');
const prettyjson = require('prettyjson');
const prettyjsonColors: any = {
    numberColor: 'yellow',
}
const chalk = require('chalk');
const { Spinner } = require('cli-spinner');
const inquirer = require('inquirer');

const CANCEL_OPTION: string = '(cancel)';

export const help: any = {
    '$ <shell command>': 'executes the specified shell command',
    'load profile <path>': 'loads the specified profile json',
    'show profile <profileId>': 'shows the specified profile',
    'delete profile <id>': 'deletes the specified profile json (must save)',
    'edit profile': 'edit a profile property (must save)',
    'new profile': 'create a new profile (must save)',
    'save profiles': 'saves the loaded profiles',
    'profiles': 'lists the loaded profiles',
    'set profile <id>': 'sets the active profile',
    'config': 'shows current cli configuration',
    'clear': 'clears the console',
    'quit': 'quit',
    'q': 'quit',
    'bye': 'quit',
    'x': 'quit',
    'help': 'help',
}

export default class CommandParser extends EventEmitter {

    private _appModel: Model;

    constructor(appModel: Model) {
        super();
        // console.log(`CommandParser: config: `, config);
        this._appModel = appModel;
    }

    get profile(): Profile {
        return this._appModel.getActiveProfile();
    }

    getConfig(): string {
        let config = {
            configFile: this._appModel.config.configFile,
        }
        return prettyjson.render(config, prettyjsonColors);
    }

    parseCommand(input: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const tokens: string[] = input.split(' ');
            const command: string = tokens[0];
            let subCommand: string = '';
            const args = tokens.slice(1);
            let cr: CommandResponse;
            let profileHelper: ProfileHelper;

            switch (command) {
                case '$':
                case 'exec':
                case 'shell':
                    this.execShellCommand(args.join(' '))
                        .then((result: any) => {
                            cr = new CommandResponse(input, result);
                            resolve(cr);
                        })
                        .catch(error => {
                            cr = new CommandResponse(input, error, CommandState.NOK);
                            reject(cr);
                        });
                    break;
                case 'clear':
                    this.execShellCommand('clear')
                        .then((result: any) => {
                            resolve(result);
                        })
                        .catch(error => {
                            reject(error);
                        });
                    break;

                case 'load':
                    subCommand = args[0];
                    resolve(this.parseLoadCommand(subCommand, args.slice(1)));
                    break;
                case 'show':
                    subCommand = args[0];
                    this.parseShowCommand(subCommand, args.slice(1))
                        .then((result: string) => {
                            resolve(result);
                        })
                        .catch((error: any) => {
                            reject(prettyjson.render(error, prettyjsonColors));
                        });
                    break;
                case 'delete':
                    subCommand = args[0];
                    resolve(this.parseDeleteCommand(subCommand, args.slice(1)));
                    break;
                case 'save':
                    subCommand = args[0];
                    this.parseSaveCommand(subCommand, args.slice(1))
                        .then((result: string) => {
                            resolve(result);
                        })
                        .catch((error: any) => {
                            reject(prettyjson.render(error, prettyjsonColors));
                        });
                    break;
                case 'edit':
                    subCommand = args[0];
                    resolve(this.parseEditCommand(subCommand, args.slice(1)));
                    break;
                case 'new':
                    subCommand = args[0];
                    resolve(this.parseNewCommand(subCommand, args.slice(1)));
                    break;
                case 'profile':
                    resolve(this.parseSetCommand('profile', []));
                    break;
                case 'profiles':
                    resolve(this.parseListCommand('profiles', []));
                    break;
                case 'list':
                    subCommand = args[0];
                    resolve(this.parseListCommand(subCommand, args.slice(1)));
                    break;
                case 'config':
                    resolve(this.getConfig());
                    break;
                case 'set':
                    subCommand = args[0];
                    resolve(this.parseSetCommand(subCommand, args.slice(1)));
                    break;
                case 'help':
                    resolve(prettyjson.render(help, prettyjsonColors));
                default:
                    resolve(`${chalk.keyword('orange')('unrecognized command:')} ${input}`);
                    break;
            }
        });
    }

    async execShellCommand(shellCommand: string) {
        // console.log(`executing shell command: ${shellCommand}`);
        const { stdout, stderr } = await exec(shellCommand);
        // console.log('stdout:', stdout);
        // console.log('stderr:', stderr);
        return stdout;
    }

    parseSetCommand(command: string, args: string[]): string {
        let result: any = '';
        switch (command) {
            case 'profile':
                var profileId: string = args.join(' ');
                if (profileId) {
                    var activeProfile: Profile = this._appModel.profiles.setActiveProfile(profileId);
                    result = `current profile set to: ${activeProfile.id}`;
                    this._appModel.saveConfig();
                } else {
                    let choices: string[] = this._appModel.profiles.getProfileIds();
                    choices.push(CANCEL_OPTION);
                    result = {
                        type: 'list',
                        name: 'mainInput',
                        message: 'Set which profile?',
                        choices: choices,
                        filter: function (val: any) {
                            if (val === CANCEL_OPTION) {
                                return '';
                            } else {
                                return `set profile ${val}`;
                            }
                        }
                    }
                }
                break;
            default:
                var profileId: string = command + ' ' + args.join(' ');
                var activeProfile: Profile = this._appModel.profiles.setActiveProfile(profileId);
                if (activeProfile) {
                    result = `current profile set to: ${activeProfile.id}`;
                    this._appModel.saveConfig();
                }
                break;
        }
        return result;
    }

    parseLoadCommand(command: string, args: string[]): string {
        let result: string = '';
        switch (command) {
            case 'profile':
                const profilePath = args[0];
                result = `loading profile: ${profilePath}`;
                jsonfile.readFile(profilePath, (err: any, obj: any) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const activeProfile: Profile = this._appModel.profiles.addProfile(obj);
                        this._appModel.saveConfig();
                    }
                });
                break;
        }
        return result;
    }

    parseDeleteCommand(command: string, args: string[]): any {
        let result: any = '';
        switch (command) {
            case 'profile':
                const profileId = args.join(' ');

                if (profileId) {
                    this._appModel.profiles.deleteProfile(profileId);
                    this._appModel.profiles.getProfileIds().forEach((profileId: string) => {
                        result += `${chalk.green(profileId)}]\n`;
                    });
                    result += `Remember to ${chalk.green('save profiles')}`;
                } else {
                    let choices: string[] = this._appModel.profiles.getProfileIds();
                    choices.push(CANCEL_OPTION);
                    result = {
                        type: 'list',
                        name: 'mainInput',
                        message: 'Delete which profile?',
                        choices: choices,
                        filter: function (val: any) {
                            if (val === CANCEL_OPTION) {
                                return '';
                            } else {
                                return `delete profile ${val}`;
                            }
                        }
                    }
                }
                break;
        }
        return result;
    }

    parseShowCommand(command: string, args: string[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let result: any = '';
            switch (command) {
                case 'profile':
                    const profileId = args.join(' ');
                    var profile: Profile | undefined;
                    if (profileId) {
                        profile = this._appModel.profiles.getProfileWithId(profileId);
                    } else {
                        let choices: string[] = this._appModel.profiles.getProfileIds();
                        choices.push(CANCEL_OPTION);
                        result = {
                            type: 'list',
                            name: 'mainInput',
                            message: 'Show which profile?',
                            choices: choices,
                            filter: function (val: any) {
                                if (val === CANCEL_OPTION) {
                                    return '';
                                } else {
                                    return `show profile ${val}`;
                                }
                            }
                        }
                    }
                    if (profile) {
                        result = prettyjson.render(profile.json, prettyjsonColors);
                    }
                    resolve(result);
                    break;
                default:
                    result = {
                        type: 'list',
                        name: 'mainInput',
                        message: 'Show what?',
                        choices: ['profile', CANCEL_OPTION],
                        filter: function (val: any) {
                            if (val === CANCEL_OPTION) {
                                return '';
                            } else {
                                return `show ${val}`;
                            }
                        }
                    }
                    resolve(result);
                    break;
            }
        });
    }

    parseSaveCommand(command: string, args: string[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let result: any = '';
            switch (command) {
                case 'profiles':
                    this._appModel.saveConfig();
                    result = `${chalk.green('saved')} profiles`;
                    resolve(result);
                    break;
                default:
                    result = {
                        type: 'list',
                        name: 'mainInput',
                        message: 'Save what?',
                        choices: ['profiles', CANCEL_OPTION],
                        filter: function (val: any) {
                            if (val === CANCEL_OPTION) {
                                return '';
                            } else {
                                return `save ${val}`;
                            }
                        }
                    }
                    resolve(result);
                    break;
            }
        });
    }

    parseEditCommand(command: string, args: string[]): any {
        let result: any = '';
        switch (command) {
            case 'profile':
                const key: string = args[0];
                const value: string = args.slice(1).join(' ');
                if (key) {
                    if (value) {
                        this._appModel.profiles.setProfileProperty(key, value);
                        result = prettyjson.render(this.profile.json, prettyjsonColors);
                    } else {
                        result = {
                            type: 'input',
                            name: 'mainInput',
                            message: 'What is the property value?',
                            filter: function (val: any) {
                                if (val === CANCEL_OPTION) {
                                    return '';
                                } else {
                                    return `edit profile ${key} ${val}`;
                                }
                            }
                        }
                    }
                } else {
                    var choices: string[] = Profile.propertyKeys;
                    choices.push(CANCEL_OPTION);
                    result = {
                        type: 'list',
                        name: 'mainInput',
                        message: 'Edit which profile property?',
                        choices: choices,
                        filter: function (val: any) {
                            if (val === CANCEL_OPTION) {
                                return '';
                            } else {
                                return `edit profile ${val}`;
                            }
                        }
                    }
                }
                break;
        }
        return result;
    }

    parseNewCommand(command: string, args: string[]): Promise<any> {
        return new Promise<any>((resolve: any, reject: any) => {
            let result: any = '';
            switch (command) {
                case 'profile':
                    const profileId: string = args.join(' ');
                    if (profileId) {
                        const newProfile = this._appModel.profiles.newProfile(profileId);
                        if (newProfile) {
                            result = prettyjson.render(this.profile.json, prettyjsonColors);
                        } else {
                            result = `${chalk.red('Error making new profile.')}`;
                        }
                        resolve(result);
                    } else {
                        const profileHelper = new ProfileHelper(this._appModel);
                        profileHelper.create()
                            .then((newProfileResult: Profile) => {
                                if (newProfileResult instanceof Profile) {
                                    this._appModel.saveConfig();
                                    result = prettyjson.render(newProfileResult.json, prettyjsonColors);
                                } else {
                                    result = `${chalk.red(newProfileResult)}`;
                                }
                                const cr = new CommandResponse('new profile', result);
                                resolve(cr);
                            });
                    }
                    break;
                default:
                    resolve(`${chalk.keyword('orange')('incomplete command:')} new ${command}`);
                    break;
            }
        })
    }

    parseListCommand(command: string, args: string[]): string {
        let result: string = '';
        switch (command) {
            case 'profiles':
                this._appModel.profiles.getProfileIds().forEach((profileId: string) => {
                    result += `${chalk.green(profileId)}\n`;
                });
                break;
        }
        return result;
    }
}