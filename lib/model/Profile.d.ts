export declare enum ProfileProperties {
    profileId = "profileId",
    userId = "userId",
    userPassword = "userPassword"
}
export default class Profile {
    static ID_KEY: string;
    data: any;
    constructor(data?: any);
    static get propertyKeys(): string[];
    get id(): string;
    set id(profileId: string);
    setProperty(key: string, value: string): void;
    get json(): any;
}
