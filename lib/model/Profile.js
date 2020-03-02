"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProfileProperties;
(function (ProfileProperties) {
    ProfileProperties["profileId"] = "profileId";
    ProfileProperties["userId"] = "userId";
    ProfileProperties["userPassword"] = "userPassword";
})(ProfileProperties = exports.ProfileProperties || (exports.ProfileProperties = {}));
class Profile {
    constructor(data) {
        if (data) {
            this.data = data;
        }
        else {
            this.data = {};
            Profile.propertyKeys.forEach(propertyKey => {
                this.data[propertyKey] = '';
            });
        }
    }
    static get propertyKeys() {
        return Object.keys(ProfileProperties);
    }
    get id() {
        return this.data.profileId;
    }
    set id(profileId) {
        if (profileId) {
            this.data.profileId = profileId;
        }
    }
    // getProperty(key: string): string {
    //     return this.data[key];
    // }
    setProperty(key, value) {
        let isValidProperty = Profile.propertyKeys.indexOf(key) != -1;
        if (key && value && isValidProperty) {
            this.data[key] = value;
        }
    }
    get json() {
        return this.data;
    }
}
exports.default = Profile;
Profile.ID_KEY = ProfileProperties.profileId;
//# sourceMappingURL=Profile.js.map