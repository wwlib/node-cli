"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Profile_1 = require("./Profile");
class Profiles {
    constructor(data) {
        this.profileMap = {};
        this.activeProfileID = data.activeProfileId;
        data.profiles.forEach((profileData) => {
            this.profileMap[profileData.profileId] = new Profile_1.default(profileData);
        });
    }
    getProfileWithId(id) {
        return this.profileMap[id];
    }
    getActiveProfile() {
        return this.profileMap[this.activeProfileID];
    }
    getDefaultProfile() {
        this.activeProfileID = Profiles.DEFAULT_ID;
        return this.profileMap[Profiles.DEFAULT_ID];
    }
    getProfileIds() {
        const profileKeys = Object.keys(this.profileMap).sort();
        return profileKeys;
    }
    setActiveProfile(id) {
        if (this.profileMap[id]) {
            this.activeProfileID = id;
        }
        return this.getActiveProfile();
    }
    setProfileProperty(key, value) {
        let profile = this.getActiveProfile();
        if (profile) {
            if (key === Profile_1.default.ID_KEY && !this.profileMap[value]) {
                let oldId = profile.id;
                let newId = value;
                delete (this.profileMap[oldId]);
                profile.setProperty(key, newId);
                this.profileMap[newId] = profile;
                this.activeProfileID = newId;
            }
            else {
                profile.setProperty(key, value);
            }
        }
    }
    addProfile(data) {
        let result = this.getActiveProfile();
        let profile = new Profile_1.default(data);
        if (profile.id) {
            this.profileMap[profile.id] = profile;
            result = this.setActiveProfile(profile.id);
        }
        return result;
    }
    newProfile(profileId, makeActiveProfile = true) {
        let result = undefined;
        let profile = new Profile_1.default();
        if (profileId && !this.profileMap[profileId]) {
            profile.id = profileId;
            this.profileMap[profile.id] = profile;
            result = profile;
            if (makeActiveProfile) {
                this.setActiveProfile(profile.id);
            }
        }
        return result;
    }
    deleteProfile(id) {
        let result = this.getActiveProfile();
        if (id == Profiles.DEFAULT_ID || !this.getProfileWithId(id)) {
            // noop
        }
        else {
            delete this.profileMap[id];
            if (id === this.activeProfileID) {
                this.activeProfileID = '';
                const profileKeys = Object.keys(this.profileMap).sort();
                profileKeys.forEach(key => {
                    if (this.profileMap[key] && !this.activeProfileID) {
                        this.activeProfileID = key;
                        result = this.setActiveProfile(this.activeProfileID);
                    }
                });
                if (!result) {
                    result = this.getDefaultProfile();
                }
            }
        }
        return result;
    }
    get json() {
        let result = {};
        result.activeProfileId = this.activeProfileID;
        result.profiles = [];
        const profileKeys = Object.keys(this.profileMap).sort();
        profileKeys.forEach(key => {
            result.profiles.push(this.profileMap[key].json);
        });
        return result;
    }
}
exports.default = Profiles;
Profiles.DEFAULT_ID = 'Default';
//# sourceMappingURL=Profiles.js.map