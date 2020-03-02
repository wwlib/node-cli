import Model from './model/Model';
export default class ProfileHelper {
    private _appModel;
    userId: string;
    userPassword: string;
    constructor(appModel: Model);
    create(): Promise<any>;
    dispose(): void;
}
