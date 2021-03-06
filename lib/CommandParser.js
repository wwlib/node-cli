"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Profile_1 = require("./model/Profile");
const CommandResponse_1 = require("./CommandResponse");
const ProfileHelper_1 = require("./ProfileHelper");
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const jsonfile = require('jsonfile');
const prettyjson = require('prettyjson');
const prettyjsonColors = {
    numberColor: 'yellow',
};
const chalk = require('chalk');
const { Spinner } = require('cli-spinner');
const inquirer = require('inquirer');
const CANCEL_OPTION = '(cancel)';
exports.help = {
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
};
class CommandParser extends events_1.EventEmitter {
    constructor(appModel) {
        super();
        // console.log(`CommandParser: config: `, config);
        this._appModel = appModel;
    }
    get profile() {
        return this._appModel.getActiveProfile();
    }
    getConfig() {
        let config = {
            configFile: this._appModel.config.configFile,
        };
        return prettyjson.render(config, prettyjsonColors);
    }
    parseCommand(input) {
        return new Promise((resolve, reject) => {
            const tokens = input.split(' ');
            const command = tokens[0];
            let subCommand = '';
            const args = tokens.slice(1);
            let cr;
            let profileHelper;
            switch (command) {
                case '$':
                case 'exec':
                case 'shell':
                    this.execShellCommand(args.join(' '))
                        .then((result) => {
                        cr = new CommandResponse_1.default(input, result);
                        resolve(cr);
                    })
                        .catch(error => {
                        cr = new CommandResponse_1.default(input, error, CommandResponse_1.CommandState.NOK);
                        reject(cr);
                    });
                    break;
                case 'clear':
                    this.execShellCommand('clear')
                        .then((result) => {
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
                        .then((result) => {
                        resolve(result);
                    })
                        .catch((error) => {
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
                        .then((result) => {
                        resolve(result);
                    })
                        .catch((error) => {
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
                    resolve(prettyjson.render(exports.help, prettyjsonColors));
                default:
                    resolve(`${chalk.keyword('orange')('unrecognized command:')} ${input}`);
                    break;
            }
        });
    }
    execShellCommand(shellCommand) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(`executing shell command: ${shellCommand}`);
            const { stdout, stderr } = yield exec(shellCommand);
            // console.log('stdout:', stdout);
            // console.log('stderr:', stderr);
            return stdout;
        });
    }
    parseSetCommand(command, args) {
        let result = '';
        switch (command) {
            case 'profile':
                var profileId = args.join(' ');
                if (profileId) {
                    var activeProfile = this._appModel.profiles.setActiveProfile(profileId);
                    result = `current profile set to: ${activeProfile.id}`;
                    this._appModel.saveConfig();
                }
                else {
                    let choices = this._appModel.profiles.getProfileIds();
                    choices.push(CANCEL_OPTION);
                    result = {
                        type: 'list',
                        name: 'mainInput',
                        message: 'Set which profile?',
                        choices: choices,
                        filter: function (val) {
                            if (val === CANCEL_OPTION) {
                                return '';
                            }
                            else {
                                return `set profile ${val}`;
                            }
                        }
                    };
                }
                break;
            default:
                var profileId = command + ' ' + args.join(' ');
                var activeProfile = this._appModel.profiles.setActiveProfile(profileId);
                if (activeProfile) {
                    result = `current profile set to: ${activeProfile.id}`;
                    this._appModel.saveConfig();
                }
                break;
        }
        return result;
    }
    parseLoadCommand(command, args) {
        let result = '';
        switch (command) {
            case 'profile':
                const profilePath = args[0];
                result = `loading profile: ${profilePath}`;
                jsonfile.readFile(profilePath, (err, obj) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        const activeProfile = this._appModel.profiles.addProfile(obj);
                        this._appModel.saveConfig();
                    }
                });
                break;
        }
        return result;
    }
    parseDeleteCommand(command, args) {
        let result = '';
        switch (command) {
            case 'profile':
                const profileId = args.join(' ');
                if (profileId) {
                    this._appModel.profiles.deleteProfile(profileId);
                    this._appModel.profiles.getProfileIds().forEach((profileId) => {
                        result += `${chalk.green(profileId)}]\n`;
                    });
                    result += `Remember to ${chalk.green('save profiles')}`;
                }
                else {
                    let choices = this._appModel.profiles.getProfileIds();
                    choices.push(CANCEL_OPTION);
                    result = {
                        type: 'list',
                        name: 'mainInput',
                        message: 'Delete which profile?',
                        choices: choices,
                        filter: function (val) {
                            if (val === CANCEL_OPTION) {
                                return '';
                            }
                            else {
                                return `delete profile ${val}`;
                            }
                        }
                    };
                }
                break;
        }
        return result;
    }
    parseShowCommand(command, args) {
        return new Promise((resolve, reject) => {
            let result = '';
            switch (command) {
                case 'profile':
                    const profileId = args.join(' ');
                    var profile;
                    if (profileId) {
                        profile = this._appModel.profiles.getProfileWithId(profileId);
                    }
                    else {
                        let choices = this._appModel.profiles.getProfileIds();
                        choices.push(CANCEL_OPTION);
                        result = {
                            type: 'list',
                            name: 'mainInput',
                            message: 'Show which profile?',
                            choices: choices,
                            filter: function (val) {
                                if (val === CANCEL_OPTION) {
                                    return '';
                                }
                                else {
                                    return `show profile ${val}`;
                                }
                            }
                        };
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
                        filter: function (val) {
                            if (val === CANCEL_OPTION) {
                                return '';
                            }
                            else {
                                return `show ${val}`;
                            }
                        }
                    };
                    resolve(result);
                    break;
            }
        });
    }
    parseSaveCommand(command, args) {
        return new Promise((resolve, reject) => {
            let result = '';
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
                        filter: function (val) {
                            if (val === CANCEL_OPTION) {
                                return '';
                            }
                            else {
                                return `save ${val}`;
                            }
                        }
                    };
                    resolve(result);
                    break;
            }
        });
    }
    parseEditCommand(command, args) {
        let result = '';
        switch (command) {
            case 'profile':
                const key = args[0];
                const value = args.slice(1).join(' ');
                if (key) {
                    if (value) {
                        this._appModel.profiles.setProfileProperty(key, value);
                        result = prettyjson.render(this.profile.json, prettyjsonColors);
                    }
                    else {
                        result = {
                            type: 'input',
                            name: 'mainInput',
                            message: 'What is the property value?',
                            filter: function (val) {
                                if (val === CANCEL_OPTION) {
                                    return '';
                                }
                                else {
                                    return `edit profile ${key} ${val}`;
                                }
                            }
                        };
                    }
                }
                else {
                    var choices = Profile_1.default.propertyKeys;
                    choices.push(CANCEL_OPTION);
                    result = {
                        type: 'list',
                        name: 'mainInput',
                        message: 'Edit which profile property?',
                        choices: choices,
                        filter: function (val) {
                            if (val === CANCEL_OPTION) {
                                return '';
                            }
                            else {
                                return `edit profile ${val}`;
                            }
                        }
                    };
                }
                break;
        }
        return result;
    }
    parseNewCommand(command, args) {
        return new Promise((resolve, reject) => {
            let result = '';
            switch (command) {
                case 'profile':
                    const profileId = args.join(' ');
                    if (profileId) {
                        const newProfile = this._appModel.profiles.newProfile(profileId);
                        if (newProfile) {
                            result = prettyjson.render(this.profile.json, prettyjsonColors);
                        }
                        else {
                            result = `${chalk.red('Error making new profile.')}`;
                        }
                        resolve(result);
                    }
                    else {
                        const profileHelper = new ProfileHelper_1.default(this._appModel);
                        profileHelper.create()
                            .then((newProfileResult) => {
                            if (newProfileResult instanceof Profile_1.default) {
                                this._appModel.saveConfig();
                                result = prettyjson.render(newProfileResult.json, prettyjsonColors);
                            }
                            else {
                                result = `${chalk.red(newProfileResult)}`;
                            }
                            const cr = new CommandResponse_1.default('new profile', result);
                            resolve(cr);
                        });
                    }
                    break;
                default:
                    resolve(`${chalk.keyword('orange')('incomplete command:')} new ${command}`);
                    break;
            }
        });
    }
    parseListCommand(command, args) {
        let result = '';
        switch (command) {
            case 'profiles':
                this._appModel.profiles.getProfileIds().forEach((profileId) => {
                    result += `${chalk.green(profileId)}\n`;
                });
                break;
        }
        return result;
    }
}
exports.default = CommandParser;
//# sourceMappingURL=CommandParser.js.map