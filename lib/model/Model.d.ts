/// <reference types="node" />
import { EventEmitter } from "events";
import Config from "./Config";
import Profiles from './Profiles';
import Profile from './Profile';
export default class Model extends EventEmitter {
    config: Config;
    profiles: Profiles;
    constructor();
    initWithData(data: any): void;
    getActiveProfile(): Profile;
    get json(): any;
    saveConfig(): void;
    reloadConfig(): void;
    getAppVerison(): string;
    dispose(): void;
}
