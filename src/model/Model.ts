import { EventEmitter } from "events";
import Config from "./Config";
import { appVersion } from './AppVersion';
import Profiles from './Profiles';
import Profile from './Profile';

let configDataTemplate: any = require('../../data/config-template.json');

export default class Model extends EventEmitter {

    public config: Config;
    public profiles: Profiles = new Profiles(configDataTemplate);

    constructor() {
        super();
        this.config = new Config();
        this.config.load((err: any, obj: any) => {
            if (err || !this.config.data) {
                console.log(`Model: Config not found. Using template.`);
                // this.config.data = configDataTemplate;
                // this.initWithData(this.config.data);
                // this.saveConfig();
                this.profiles = new Profiles(configDataTemplate);
            } else {
                // this.initWithData(this.config.data);
                this.profiles = new Profiles(this.config.data);
            }
            this.emit('ready', this);
        });
    }

    initWithData(data: any): void {
    }

    getActiveProfile(): Profile {
        return this.profiles.getActiveProfile();
    }

    get json(): any {
        let result: any = {}
        return result;
    }

    saveConfig(): void {
        // console.log(`saveConfig: `, this.profiles.json);
        this.config.data = this.profiles.json;
        this.config.save((err: any) => {
            if (err) {
                console.log(`Model: Error saving config: `, err);
            }
        });
    }

    reloadConfig(): void {
        this.config.load((err: any, obj: any) => {
            if (err || !this.config.data) {
                console.log(`Model: Config not found. Using template.`);
                // this.config.data = configDataTemplate;
                // this.initWithData(this.config.data);
                this.profiles = new Profiles(configDataTemplate);
            } else {
                // this.initWithData(this.config.data);
                this.profiles = new Profiles(this.config.data);
            }
            this.emit('updateModel', this);
        });
    }

    getAppVerison(): string {
        return appVersion;
    }

    dispose(): void {
        configDataTemplate = undefined;
        delete(this.config);// = null;
    }
}